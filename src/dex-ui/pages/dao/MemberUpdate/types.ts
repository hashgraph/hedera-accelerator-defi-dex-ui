export interface AddMemberForm {
  memberAddress: string;
  newThreshold: number;
}

export interface DeleteMemberForm {
  newThreshold: number;
}

export interface ReplaceMemberForm {
  memberAddress: string;
}

export interface ChangeThresholdForm {
  newThreshold: number;
}

export type MemberUpdateForm = AddMemberForm | DeleteMemberForm | ReplaceMemberForm | ChangeThresholdForm;

export enum MemberOperationsType {
  AddMember = "add-member",
  DeleteMember = "remove-member",
  ReplaceMember = "replace-member",
  ChangeThreshold = "change-threshold",
}
