import { ErrorMessage } from "./Error";
import { Action } from "./actions";

interface NavbarProps {
    connect: () => void;
}

interface NewMemberProps {
    message: ErrorMessage;
}

interface ProposalProps {
    proposal: Proposal
    handleVote?: (proposalAddress: string, support: boolean, abstain: boolean) => void;
    handleExecute?: (proposalAddress: string) => void;
}

interface ProposalFormProps {
    handleSubmit: (title: string, description: string, recipient?: string, amount?: number) => void;
}

interface BuyFormProps {
    buyType: Action;
    handleSubmit: (amount: number, buyTipe: string) => void;
    handleChange: (amount: number, buyTipe: string) => number;
    DNABalance?: number;
    currentSupply?: number;
    tokenPrice?: number;
}

interface DelegationFormProps {
    delegationType: string;
    handleSubmitDelegation: (memberAddress: string, delegationType: string) => void;
}

interface Proposal {
    address: string;
    title: string;
    description: string;
    voteCountPro: number;
    voteCountCon: number;
    voteCountAbstain: number;
    executed: boolean;
    approved: boolean;
    recipient: string;
    amount: number;
}

interface CustomSelectProps {
    input: string;
    handleChanges: () => void;
}

interface LoaderProps {
    loading: boolean
}

export type { NavbarProps, NewMemberProps, ProposalProps, Proposal, CustomSelectProps, ProposalFormProps, BuyFormProps, LoaderProps, DelegationFormProps }