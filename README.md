# dna-dapp
<h3>Dapp DAO Governance per Start2Impact University</h3>

>
>Il progetto **dna-dapp** è un applicazione web usata come interfaccia grafica degli Smart Contract contenuti nel repository:<br> https://github.com/OtreborHub/dna-dao. <br>L'applicativo è realizzato con React, in Typescript, e contiene tutte le funzionalità esposte dagli smart contracts DnA. 
>
>E' possibile utilizzare l'applicativo deployato su Vercel al seguente link:<br> https://dna-dapp.vercel.app/

<h3>Login</h3>
Dalla home tramite il pulsante Connect Wallet sulla Navbar sarà possibile collegare il proprio wallet. E' consigliabile utilizzare un wallet Metamask.

<h3>Iscrizione alla Governance</h3>
Una volta loggati, sarà possibile una sarie di azioni in successione, in particolare:<br><br>

1. **Acquisto DNA Token**: l'utente sceglierà l'importo in wei con cui acquistare i token e all'esecuzione della transazione vedrà il suo bilancio, nella Navbar, aggiornarsi. Una volta acquistati i Token possiamo comprare le Share con altri due semplici step.

2. **Approvazione DNA Token**: in questo caso l'utente sceglie l'importo di DNA Token da far approvare per l'acquisto delle Shares. Quel che succede dietro le quinte, è che stiamo approvando il contratto DAO ad utilizzare una quantità corrispondente all'importo di DNA Token.

3. **Acquisto Shares**: l'utente ora può acquistare parte delle Shares DNA tramite i DNA Token approvati. Una volta membro, la procedurà sarà la stessa per acquistare altre azioni, ma tutto può essere svolto tramite il Menù Ruolo nella Navbar.


<h3>Primo accesso alla Governance</h3>
Ogni utente, una volta acquistate parte delle Shares DNA, diventerà membro della Governance DNA, accedendo alla Dashboard delle proposte. La valuta principale, nella Navbar ora saranno le DNA Shares e ad ogni membro sono concesse le funzionalità di:<br>

* Creazione di una proposta: sarà sufficente inserire un titolo e una descrizione per creare una proposta. E' disponibile la possibilità di inviare DNA Token ad un membro della Governance.<br>

* Voto di una proposta: è possibile votare a supporto della proposta, contestarla o astenersi. Il risultato ottenuto dall'astenimento e dalla non votazione è il medesimo.

* Delega membro: ogni membro (delegante) può delegare il proprio voto ad un altro membro (delegato). Nel caso il delegato voti prima del delegante, allora il delegante avrà perso il diritto al voto per quella proposta. Nel caso il delegante voti prima del delegato, allora la delega non avrà effetto.

* Revoca delega: è sempre prossibile eliminare una delega inserita precedentemente.<br><br>

>**Nota**<br> L'Owner dei contratti è considerato un utente superparte, e non ha poteri di acquisto di DNA Token o Shares.
Le uniche azioni disponibili per l'Owner sono l'esecuzione delle proposte, l'abilitazione/disabilitazione della vendita degli Shares e la modifica sul prezzo di acquisto dei DNA Token.
>
> L'applicativo impone che è possibile effettuarel'aggiornamento del prezzo dei DNA Token soltanto quando la vendita degli Shares è disabilitata.<br><br>
>

L'applicativo è utilizza Material UI, Google Fonts, sweetalert2 come supporto alla creazione dell'interfaccia.

Ogni funzionalità che coinvolge Metamask è collegata tramite ethers e i bridge (vedi DAOBridge.ts e DNABridge.ts) ad una funzione specifica degli smart contract. Nelle classi bridge vengono anche raccolti gli eventi utili a sincronizzare per quanto possibile l'applicativo con l'esecuzione delle transazioni effettuate dall'utente.

>Tutto il codice utile è contenuto nella cartella src:
>
>(folder)**/abi**: contiene gli abi degli smart contract utilizzati
>(folder)**/utilities**: contiene i file trasversali al progetto, come le classi bridge, la gestione degli errori e della formattazione del testo. 
>(folder)**/components**: infatti troviamo prima i componenti sempre presenti a schermo e diverse sottocartelle di componenti che vengono visualizzati sulla base del wallet collegato (e del suo ruolo nella Governance DNA):
  * <i> cards </i> con gli elementi frontend che rappresentano le singole proposte. 
  * <i> forms </i> con gli elementi frontend che richiedono azioni di input e di submit da parte dell'utente. 
  * <i> view </i> con gli elementi frontend visualizzati per i membri della Governance DNA e per i nuovi utenti.

<h2><b>Eseguire il progetto in locale</b></h2>

*Installazione*

Partendo dalla root del progetto science-magazine-store aprire il terminale ed eseguire

> **npm install**

Verranno scaricate tutte le librerie necessarie alla compilazione del progetto.
Rinominare il file ".env modifyHere" nella root del progetto con il nome ".env" ed inserire la propria Infura Api Key e gli indirizzi dei contratti che deployerai sotto le voci <br>
REACT_APP_INFURA_API_KEY= <br>
REACT_APP_DNAERC20_ADDRESS= <br>
REACT_APP_DNADAO_ADDRESS=

*Esecuzione*

Dalla root del progetto eseguire

> **npm start**

<br>
<h3>Sitemap</h3>

DAO Smart Contract Repo: https://github.com/OtreborHub/dna-dao <br>
Deployed DApp: https://dna-dapp.vercel.app <br>
Contratto DNAERC20: https://sepolia.etherscan.io/address/0x56c5b5d0dd6ee0934dde01f7240f16c90af16173 <br>
Contratto DNADAO: https://sepolia.etherscan.io/address/0xfce9b898e6caa81e08f55d4bf950f646d1c656d1