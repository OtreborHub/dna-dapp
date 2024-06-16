import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAppContext } from "../../Context";
import "../../styles/error.css";
import { buyShares } from "../../utilities/DAOBridge";
import { approveDNAToken, buyDNAToken, readAllowance, readCurrentSupply } from "../../utilities/DNABridge";
import { ErrorMessage, swalError, transformMessage } from '../../utilities/Error';
import { ErrorProps } from "../../utilities/interfaces";
import Loader from "../Loader";
import BuyForm from "../forms/BuyForm";
import withReactContent from "sweetalert2-react-content";
import { ethers } from "ethers";
import { formatWeiBalance } from "../../utilities/helper";

export default function NewMemberView({ errorMessage }: ErrorProps) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [currentSupply, setCurrentSupply] = useState<number>(0);
	const appContext = useAppContext();
	const MySwal = withReactContent(Swal);

	useEffect(() => {
		getCurrentSupply();
	})

	async function getCurrentSupply() {
		try {
			const supply = await readCurrentSupply();
			setCurrentSupply(supply ? supply : 0);
		} catch (error) {
			console.log("Error while reading contract data");
		}
	}

	async function handleSubmit(amount: number, buyType: string) {
		let success;
		setIsLoading(true);
		if (buyType === "DNA") {
			success = await buyDNAToken(amount);
		} else if (buyType === "Shares") {
			success = Boolean(await buyShares(amount));
		} else if (buyType === "Approve") {
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
			console.log("Errore durante l'operazione di acquisto/approvazione DNA o Shares");
		}
	}

	function handleChange(amount: number, buyType: string) {
		const { balance, DNABalance, allowance } = appContext;
		const weiBalance = formatWeiBalance(balance);

		if (buyType === "Shares" && amount >= DNABalance) {
			return appContext.DNABalance;
		} else if (buyType === "DNA" && amount >= weiBalance && weiBalance <= currentSupply) {
			return weiBalance;
		} else if (buyType === "DNA" && amount >= currentSupply && weiBalance >= currentSupply) {
			return currentSupply;
		} else if (buyType === "Approve" && amount >= DNABalance) {
			return DNABalance;
		} else if (buyType === "Shares" && amount >= allowance){
			return allowance;
		} else {
			return amount;
		}
	}

	function buyDNA() {
		if (appContext.balance > 0) {
			MySwal.fire({
				title: "Acquisto DNA",
				icon: "question",
				html: <BuyForm handleSubmit={handleSubmit} handleChange={handleChange} buyType="DNA" currentSupply={currentSupply} balance={formatWeiBalance(appContext.balance)} />,
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
				html: <BuyForm handleSubmit={handleSubmit} handleChange={handleChange} buyType="Shares" DNABalance={appContext.DNABalance} />,
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
				title: "Acquista DNA Shares",
				icon: "question",
				html: <BuyForm handleSubmit={handleSubmit} handleChange={handleChange} buyType="Approve" DNABalance={appContext.allowance} />,
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

				{transformMessage(errorMessage)[0]}
				<br />
				{transformMessage(errorMessage)[1]}

				<Button
					onClick={buyDNA}
					variant="contained"
					color="primary"
					style={{ width: "15%", borderRadius: "4rem", marginTop: "2rem" }}>
					ACQUISTA DNA
				</Button>
				<Typography fontSize={"small"}>Rimangono {currentSupply} DNA disponibili</Typography>

				{errorMessage === ErrorMessage.NOT_MEMBER &&
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
						{appContext.DNABalance === appContext.allowance &&
							<Typography fontSize={"small"}>Tutti i DNA Token sono stati approvati all'acquisto degli shares</Typography>
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