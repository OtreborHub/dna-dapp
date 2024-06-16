export enum Vote {
  SUPPORT = 1,
  ABSTAIN = 0,
  CONTEST = -1
}

export default function parseVote (vote:Vote) {
  let votes: boolean[] = [false, false];
  if(vote === Vote.SUPPORT){
    votes[0] = true;
    votes[1] = false;
  } else if (vote === Vote.ABSTAIN){
    votes[0] = false;
    votes[1] = true;
  }

  return votes;
}