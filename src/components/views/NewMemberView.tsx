import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "../../Context";
import { buyShares } from "../../utilities/DAOBridge";
import { approveDNAToken, buyDNAToken } from "../../utilities/DNABridge";
import { ErrorMessage, swalError, transformMessage } from '../../utilities/Error';
import { Action } from "../../utilities/actions";
import { formatWeiBalance } from "../../utilities/helper";
import { NewMemberProps } from "../../utilities/interfaces";
import Loader from "../Loader";
import BuyForm from "../forms/BuyForm";

export default function NewMemberView({ message }: NewMemberProps) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const appContext = useAppContext();
	const MySwal = withReactContent(Swal);

	async function handleSubmit(amount: number, buyType: string) {
		let success;
		setIsLoading(true);
		if (buyType === Action.BUY_DNA) {
			success = await buyDNAToken(amount);
		} else if (buyType === Action.BUY_SHARES) {
			success = Boolean(await buyShares(amount));
		} else if (buyType === Action.APPROVE_DNA) {
			success = await approveDNAToken(amount);
		}
		setIsLoading(false);
		if (success) {
			Swal.fire({
				icon: "success",
				title: buyType === "Approva" ? "Richiesta di approvazione effettuata!" : "Richiesta di acquisto effettuata!",
				text: "L'elaborazione della richiesta avverrà tra qualche secondo.\n\nPer OK Per continuare.",
				showCloseButton: true,
				showConfirmButton: true,
				confirmButtonColor: "#3085d6",
			});
		} else {
			console.log("Error during operation : " + buyType);
		}
	}

	function handleChange(amount: number, buyType: string) {
		const { balance, DNABalance, allowance, currentSupply } = appContext;
		const weiBalance = formatWeiBalance(balance);

		if (amount < 0) {
			return 0;
		}

		if (buyType === Action.BUY_SHARES && amount >= DNABalance) {
			return appContext.DNABalance;
		} else if (buyType === Action.BUY_DNA && amount >= weiBalance && weiBalance <= currentSupply) {
			return weiBalance;
		} else if (buyType === Action.BUY_DNA && amount >= currentSupply && weiBalance >= currentSupply) {
			return currentSupply;
		} else if (buyType === Action.APPROVE_DNA && amount >= DNABalance) {
			return DNABalance;
		} else if (buyType === Action.BUY_SHARES && amount >= allowance) {
			return allowance;
		} else {
			return amount;
		}
	}

	function buyDNA() {
		if (appContext.balance > 0) {
			MySwal.fire({
				title: "Acquisto DNA Token ",
				icon: "question",
				html: <BuyForm
					buyType={Action.BUY_DNA}
					handleSubmit={handleSubmit}
					handleChange={handleChange}
					currentSupply={appContext.currentSupply} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF);
		}
	}

	function approveDNA() {
		if (appContext.DNABalance > 0) {
			MySwal.fire({
				title: "Approva DNA Token",
				icon: "question",
				html: <BuyForm
					buyType={Action.APPROVE_DNA}
					handleSubmit={handleSubmit}
					handleChange={handleChange}
					DNABalance={appContext.allowance} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF);
		}
	}

	function buyDNAShares() {
		if (appContext.DNABalance > 0) {
			MySwal.fire({
				title: "Acquista DNA Shares",
				icon: "question",
				html: <BuyForm
					buyType={Action.BUY_SHARES}
					handleSubmit={handleSubmit}
					handleChange={handleChange}
					DNABalance={appContext.DNABalance} />,
				showConfirmButton: false,
				showCloseButton: true,
			})
		} else {
			swalError(ErrorMessage.IF);
		}
	}

	const verifyAllowance = () => {
		return appContext.DNABalance > 0 && appContext.allowance > 0;
	}

	const verifyBalance = () => {
		return appContext.DNABalance > 0 && appContext.DNABalance > appContext.allowance;
	}

	return (
		<>
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					fontSize: 'calc(10px + 2vmin)',
					color: 'black',
					fontFamily: '"Bebas Neue", sans-serif',
					textAlign: 'center',
					p: 2,
				}}
			>

				{transformMessage(message)[0]}
				<br />
				{transformMessage(message)[1]}

				<Button
					onClick={buyDNA}
					variant="contained"
					color="primary"
					style={{ width: "15%", borderRadius: "4rem", marginTop: "2rem" }}>
					ACQUISTA DNA
				</Button>
				<Typography fontSize={"small"}>Rimangono {appContext.currentSupply} DNA disponibili</Typography>

				{message === ErrorMessage.NOT_MEMBER &&
					<>
						<br />
						{transformMessage(ErrorMessage.APPROVE_ISTRUCTION)[0]}
						<br />
						{transformMessage(ErrorMessage.APPROVE_ISTRUCTION)[1]}

						<Button
							onClick={approveDNA}
							variant={!verifyBalance() ? "outlined" : "contained"}
							color="primary"
							disabled={!verifyBalance()}
							style={{ width: "15%", borderRadius: "4rem", marginTop: "2rem" }}>
							APPROVA DNA
						</Button>
						<Typography fontSize={"small"}>Ricorda che ogni approvazione sovrascrive la precedente</Typography>
						{appContext.DNABalance === appContext.allowance &&
							<Typography fontSize={"small"}>Tutti i DNA Token sono stati approvati all'acquisto degli shares</Typography>
						}
						{appContext.DNABalance > appContext.allowance &&
							<Typography fontSize={"small"}>Hai approvato solo { appContext.allowance} DNA</Typography>
						}
						<Button
							onClick={buyDNAShares}
							variant={!verifyAllowance() ? "outlined" : "contained"}
							color="primary"
							disabled={!verifyAllowance()}
							style={{ width: "15%", borderRadius: "4rem", marginTop: "1.5rem" }}>
							ACQUISTA SHARES
						</Button>
					</>
				}
			</Box>

			<Loader loading={isLoading} />
		</>
	)
}