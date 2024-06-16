import { ErrorMessage } from "./Error";

interface NavbarProps {
    connect: () => void;
}

interface ErrorProps {
    errorMessage: ErrorMessage;
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
    buyType: string;
    handleSubmit: (amount: number, buyTime: string) => void;
    handleChange: (amount: number, buyTime: string) => number;
    balance?: number;
    DNABalance?: number;
    currentSupply?: number;
}

interface Proposal {
    address: string;
    title: string;
    description: string;
    voteCountPro: number;
    voteCountCon: number;
    voteCountAbstain: number;
    executed: boolean;
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

export type { NavbarProps, ErrorProps, ProposalProps, Proposal, CustomSelectProps, ProposalFormProps, BuyFormProps, LoaderProps }