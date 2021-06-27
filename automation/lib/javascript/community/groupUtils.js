/*
Get the members of a group as an array of their names.
Tested to work with openHAB 3.0.2
*/

/*
Constructor, initializes the logger.
*/
var GroupUtils = function () {
  this.log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.GroupUtils")
}

/*
Get only the direct members of a group as an array.
*/
GroupUtils.prototype.getMembers = function (groupName) {
  this.log.debug('Getting direct members of group ' + groupName)
  var membersString = new String(ir.getItem(groupName).members)
  var membersSplit = membersString.split(' (Type')
  var firstMember = membersSplit[0].split('[')
  var groupMembers = [firstMember[1]]
  this.log.debug('Group member: ' + firstMember[1])
  // remove the first element
  membersSplit.splice(0, 1)
  // remove the last element
  membersSplit.splice(-1, 1)
  // iterate over the rest of membersSplit and add to groupMembers
  for (var index in membersSplit) {
    var nMember = membersSplit[index].split(']), ')
    groupMembers.push(nMember[1])
    this.log.debug('Group member: ' + nMember[1])
  }
  // return the array
  return groupMembers
}

/*
Get all (also childs) members of a group as an array.
*/
GroupUtils.prototype.getAllMembers = function (groupName) {
  this.log.debug('Getting all members of group ' + groupName)
  var membersString = new String(ir.getItem(groupName).allMembers)
  var membersSplit = membersString.split(' (Type')
  var firstMember = membersSplit[0].split('[')
  var groupMembers = [firstMember[1]]
  // remove the first element
  membersSplit.splice(0, 1)  
  // remove the last element
  membersSplit.splice(-1, 1)
  // iterate over the rest of membersSplit and add to groupMembers
  for (var index in membersSplit) {
    var nMember = membersSplit[index].split(']), ')
    groupMembers.push(nMember[1])
    this.log.debug('Group member: ' + nMember[1])
  }
  // return the array
  return groupMembers
}
