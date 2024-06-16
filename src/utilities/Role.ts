export enum Role {
    OWNER = "Owner",
    MEMBER = "Member",
    VISITOR = "Visitor",
    NONE = ""
}

export function getRole(owner: boolean, member: boolean){
    if(owner){
        return Role.OWNER
      } else if (member) {
        return Role.MEMBER
      } else {
        return Role.VISITOR;
      }
}