### shaddow.py python3 compatible fork ###
#
## Original script from: https://github.com/pmpkk/openhab-habpanel-theme-matrix/blob/master/shaddow.py
## For how to use see: https://community.openhab.org/t/show-current-sun-position-and-shadow-of-house-generate-svg/34764
## Original script: Copyright (c) 2017 pmpkk under MIT Licence
##
## Author of changes: Copyright (c) 2021 Florian Hotze under MIT License
## Changes:
##    - Python 3 compatible
##    - using InfluxDB v2's FLUX language instead of the InfluxQL by influxdb_client Python Library
##    - using OpenHAB Python Library
##    - added current position of moon
##
## install dependencies with:
##  - "sudo -H python3 -m pip install influxdb-client"
##  - "sudo -h python3 -m pip install python-openhab"

import math
import time
from datetime import datetime, timedelta, date
import sys
from shutil import copyfile
from influxdb_client import InfluxDBClient
from openhab import OpenHAB

## initialize openHAB client
base_url="http://localhost:8080/rest"
openhab = OpenHAB(base_url)
items = openhab.fetch_all_items()

## initialize InfluxDB client
url = 'http://localhost:8086'
token = 'influxdb-token'
org = 'influxdb-bucket'
client = InfluxDBClient(url=url, token=token, org=org)
query_api = client.query_api()

WIDTH = 100
HEIGHT = 100
PRIMARY_COLOR = '#388e3c' #'#1b3024'
LIGHT_COLOR = '#d32f2f' #'#26bf75'
MOON_COLOR = '#1976d2'
STROKE_WIDTH = '1'
FILENAME = '/etc/openhab/html/shaddow.svg'

# Shape of the house in a 100 by 100 units square
SHAPE = [{'x': 25.44, 'y': 06.40}, \
        {'x': 72.83, 'y': 11.68}, \
        {'x': 68.84, 'y': 43.32}, \
        {'x': 68.84, 'y': 49.05}, \
        {'x': 71.86, 'y': 92.29}, \
        {'x': 36.71, 'y': 94.46}, \
        {'x': 35.71, 'y': 80.09}, \
        {'x': 30.22, 'y': 80.43}, \
        {'x': 29.28, 'y': 66.77}, \
        {'x': 34.76, 'y': 66.43}, \
        {'x': 33.55, 'y': 49.10}, \
        {'x': 35.38, 'y': 49.05}, \
        {'x': 34.38, 'y': 39.93}, \
        {'x': 21.40, 'y':38.48}]

HOURS = 1
DEGS = []

class shaddow(object):
    """
    
    Shaddow Object
    """
    def __init__(self):

        self.debug = False 
        self.azimuth = float(items.get('Sun_Azimuth').state)
        print(f'openHAB: "Sun_Azimuth" is: "{self.azimuth}"')
        self.moon_azimuth = float(items.get('Moon_Azimuth').state)
        print(f'openHAB: "Moon_Azimuth" is: "{self.moon_azimuth}"')
        self.elevation = float(items.get('Sun_Elevation').state)
        print(f'openHAB: "Sun_Elevation" is: "{self.elevation}"')
        self.sunrise_azimuth = float(items.get('Sunrise_Azimuth').state)
        print(f'openHAB: "Sunrise_Azimuth" is: "{self.sunrise_azimuth}"')
        self.sunset_azimuth = float(items.get('Sunset_Azimuth').state)
        print(f'openHAB: "Sunset_Azimuth" is: "{self.sunset_azimuth}"')
        ts = time.time()
        utc_offset = (datetime.fromtimestamp(ts) - datetime.utcfromtimestamp(ts)).total_seconds()/3600
        for h in range(0,24,HOURS):
            t = datetime.combine(date.today(), datetime.min.time()) + timedelta(hours=-utc_offset+h-24)
            querytime = t.strftime('%Y-%m-%dT%H:%M:%S') + 'Z'
            query = (f'from(bucket: "openhab")\
              |> range(start: {querytime})\
              |> filter(fn: (r) => r["_measurement"] == "Sun_Azimuth")\
              |> first()\
              |> yield(name: "mean")')
            result = client.query_api().query(org=org, query=query)
            results = []
            for table in result:
              for record in table.records:
                results.append((record.get_value()))
            a = float(record["_value"])
            print(f'InfluxDB: "Sun_Azimuth" at: "{querytime}"; value: "{a}"')
            if (a == None): a = 0
            DEGS.extend([a])

    def generatePath(self,stroke,fill,points,attrs=None):

        p = ''
        p = p + '<path stroke="' + stroke + '" stroke-width="' + STROKE_WIDTH + '" fill="' + fill + '" '
        if (attrs != None): p = p + ' ' + attrs + ' '
        p = p + ' d="'
        for point in points:
            if (points.index(point) == 0):
                p = p + 'M' + str(point['x']) + ' ' + str(point['y'])
            else:
                p = p + ' L' + str(point['x']) + ' ' + str(point['y'])
        p = p + '" />'

        return p

    def generateArc(self,dist,stroke,start,end,attrs=None):

        p = ''
        try:
            angle = end-start
            if (angle<0):
                angle = 360 + angle

            p = p + '<path d="M' + str(self.degreesToPoint(start,dist)['x']) + ' ' + str(self.degreesToPoint(start,dist)['y']) + ' '
            p = p + 'A' + str(dist) + ' ' + str(dist) + ' 0 '
            if (angle<180):
                p = p + '0 1 '
            else:
                p = p + '1 1 '
            p = p + str(self.degreesToPoint(end,dist)['x']) + ' ' + str(self.degreesToPoint(end,dist)['y']) + '"'
            p = p + ' stroke="' + stroke + '"'
            if (attrs != None): 
                p = p + ' ' + attrs + ' '
            else:
                p = p + ' stroke-width="' + STROKE_WIDTH + '" fill="none" '
            p = p + ' />'
        except:
            p = ''

        return p	

    def degreesToPoint(self,d,r):

        coordinates = {'x': 0, 'y': 0}
        cx = WIDTH / 2
        cy = HEIGHT / 2 
        d2 = 180 - d
        coordinates['x'] = cx + math.sin(math.radians(d2))*r
        coordinates['y'] = cy + math.cos(math.radians(d2))*r

        return coordinates

    def generateSVG(self):

        realSun = self.degreesToPoint(self.azimuth, 10000)
        if self.debug: print(realSun)

        sun = self.degreesToPoint(self.azimuth, WIDTH / 2)
        
        realMoon = self.degreesToPoint(self.moon_azimuth, 10000)
        if self.debug: print(realMoon)

        moon = self.degreesToPoint(self.moon_azimuth, WIDTH / 2)

        minPoint = -1
        maxPoint = -1

        i = 0

        minAngle = 999
        maxAngle = -999
        for point in SHAPE:
            #Angle of close light source
            angle = -math.degrees(math.atan2(point['y']-sun['y'],point['x']-sun['x']))
            #Angle of distant light source (e.g. sun)
            angle = -math.degrees(math.atan2(point['y']-realSun['y'],point['x']-realSun['x']))
            distance = math.sqrt(math.pow(sun['y']-point['y'],2) + math.pow(sun['x']-point['x'],2))
            if (angle<minAngle): 
                minAngle = angle
                minPoint = i
            if (angle>maxAngle): 
                maxAngle = angle
                maxPoint = i
            point['angle'] = angle
            point['distance'] = distance
            if self.debug: print(str(i).ljust(10),":", str(point['x']).ljust(10), str(point['y']).ljust(10), str(round(angle,7)).ljust(10), str(round(distance)).ljust(10))
            i = i + 1

        if self.debug: 
            print("Min Point = ",minPoint)
            print("Max Point = ",maxPoint)
            print("")

        i = minPoint
        k = 0
        side1Distance = 0
        side2Distance = 0
        side1Done = False
        side2Done = False
        side1 = []
        side2 = []
        while True:
            if (side1Done == False):
                side1Distance = side1Distance + SHAPE[i]['distance']
                if(i != minPoint and i != maxPoint): SHAPE[i]['side'] = 1
                if (i == maxPoint): side1Done = True
                side1.append( { 'x': SHAPE[i]['x'], 'y': SHAPE[i]['y'] } )
            if (side1Done == True):
                side2Distance = side2Distance + SHAPE[i]['distance']
                if(i != minPoint and i != maxPoint): SHAPE[i]['side'] = 2
                if (i == minPoint): side2Done = True
                side2.append( { 'x': SHAPE[i]['x'], 'y': SHAPE[i]['y'] } )

            i = i + 1
            if( i > len(SHAPE)-1): i = 0

            if (side1Done and side2Done): break

            k = k + 1
            if (k == 20): break

        svg = '<?xml version="1.0" encoding="utf-8"?>'
        svg = svg + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
        svg = svg + '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="-10 -10 120 120" xml:space="preserve">'

        minPointShaddowX = SHAPE[minPoint]['x'] + WIDTH * math.cos(math.radians(minAngle))
        minPointShaddowY = SHAPE[minPoint]['y'] - HEIGHT * math.sin(math.radians(minAngle))
        maxPointShaddowX = SHAPE[maxPoint]['x'] + WIDTH * math.cos(math.radians(maxAngle))
        maxPointShaddowY = SHAPE[maxPoint]['y'] - HEIGHT * math.sin(math.radians(maxAngle))

        shaddow = [ {'x': maxPointShaddowX, 'y': maxPointShaddowY } ] + \
                side2 + \
                [ {'x': minPointShaddowX, 'y': minPointShaddowY } ]
        
        svg = svg + '<defs><mask id="shaddowMask">'
        svg = svg + '      <rect width="100%" height="100%" fill="black"/>'
        svg = svg + '      <circle cx="' + str(WIDTH/2) + '" cy="' + str(HEIGHT/2) + '" r="' + str(WIDTH/2-1) + '" fill="white"/>'
        svg = svg + '</mask></defs>'

        svg = svg + self.generatePath('none',PRIMARY_COLOR,SHAPE)

        shaddow_svg = self.generatePath('none','black',shaddow,'mask="url(#shaddowMask)" fill-opacity="0.5"')

        if (self.elevation>0): 
            svg = svg + self.generatePath(LIGHT_COLOR,'none',side1)
        else:
            svg = svg + self.generatePath(PRIMARY_COLOR,'none',side1)

        if (self.elevation>0): svg = svg + shaddow_svg

        svg = svg + self.generateArc(WIDTH/2,PRIMARY_COLOR,self.sunset_azimuth,self.sunrise_azimuth)
        svg = svg + self.generateArc(WIDTH/2,LIGHT_COLOR,self.sunrise_azimuth,self.sunset_azimuth)

        svg = svg + self.generatePath(LIGHT_COLOR,'none',[self.degreesToPoint(self.sunrise_azimuth,WIDTH/2-2), self.degreesToPoint(self.sunrise_azimuth,WIDTH/2+2)])
        svg = svg + self.generatePath(LIGHT_COLOR,'none',[self.degreesToPoint(self.sunset_azimuth,WIDTH/2-2), self.degreesToPoint(self.sunset_azimuth,WIDTH/2+2)])

        for i in range(0,len(DEGS)):
            if (i == len(DEGS)-1):
                j = 0
            else:
                j = i + 1
            if (i % 2 == 0):
                svg = svg + self.generateArc(WIDTH/2+8,PRIMARY_COLOR,DEGS[i],DEGS[j],'stroke-width="3" fill="none" stroke-opacity="0.2"')	
            else:
                svg = svg + self.generateArc(WIDTH/2+8,PRIMARY_COLOR,DEGS[i],DEGS[j],'stroke-width="3" fill="none"')

        # generate path for the line at midnight
        svg = svg + self.generatePath(LIGHT_COLOR,'none',[self.degreesToPoint(DEGS[0],WIDTH/2+5), self.degreesToPoint(DEGS[0],WIDTH/2+11)])
        # generate path for the line at lunchtime
        svg = svg + self.generatePath(LIGHT_COLOR,'none',[self.degreesToPoint(DEGS[12],WIDTH/2+5), self.degreesToPoint(DEGS[12],WIDTH/2+11)])

        # add the sun icon
        svg = svg + '<circle cx="' + str(sun['x']) + '" cy="' + str(sun['y']) + '" r="3" stroke="' + LIGHT_COLOR + '" stroke-width="' + STROKE_WIDTH + '" fill="' + LIGHT_COLOR + '" />'
        # add the moon icon
        svg = svg + '<circle cx="' + str(moon['x']) + '" cy="' + str(moon['y']) + '" r="2" stroke="' + MOON_COLOR + '" stroke-width="' + STROKE_WIDTH + '" fill="' + MOON_COLOR + '" />'



        svg = svg + '</svg>'

        if self.debug: print(svg)

        f = open(FILENAME, 'w')
        f.write(svg)
        f.close()


def main():

    t1 = time.time()

    s = shaddow()

    args = sys.argv
    
    if(len(args) == 1):
        print('\033[91mNo parameters specified\033[0;0m')
    else:
        if(args[1] == "update"):
            s.generateSVG()

    t2 = time.time()
    print("Done in " + str(t2-t1) + " seconds")

if __name__ == '__main__':
    main()
