import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: false,
});

const ETH_ADDRESS_REGEXP = /^(0x)[0-9A-Fa-f]{40}$/;

const TOKENS = {
  'GOERLI': [
    { value: 'USDT', label: 'USDT (Tether USD)' },
    { value: 'USDC', label: 'USDC (USD Coin)' },
    { value: 'UNI', label: 'UNI (Uniswap)' },
    { value: 'SUSHI', label: 'SUSHI (ShushiToken)' },
    { value: 'SAND', label: 'SAND (Sandbox)' },
    { value: 'AAVE', label: 'AAVE (Aave)' },
    { value: 'AXS', label: 'AXS (Axie Infinity Shard)' },
    { value: 'CRV', label: 'CRV (Curve DAO Token)' },
    { value: 'DAI', label: 'DAI (Dai Stablecoin)' },
    { value: 'MANA', label: 'MANA (Decentraland)' },
    { value: 'USDP', label: 'USDP (Pax Dollar)' },
    { value: 'PAXG', label: 'PAXG (Paxos Gold)' },
  ],
};

const CONTRACT_ADDRESSES: { [key: string]: { [key: string]: string } } = {
  "USDT": { "GOERLI": "0x77Ff079c57cB5b84Bc30b1cA9b9773c158220c9c" },
  "USDC": { "GOERLI": "0x935308fb0b9fF41f3878cf9957BD7cD0F18E2B36" },
  "AAVE": { "GOERLI": "0xb4623474E3fD71687aD82d8eE8cBb2e650d21C84" },
  "AXS": { "GOERLI": "0xe8a2D9Aec548fB19C8B42d86C44BF868abd75d89" },
  "CRV": { "GOERLI": "0x70C07277a9f581bE216ED13D78d048B403894Ea3" },
  "UNI": { "GOERLI": "0x23183A639491aeb7A82FF4CCA38FD06b6bd9780E" },
  "DAI": { "GOERLI": "0xDE40AFBa2F658A8D06498f5BFD22f07129cBb413" },
  "MANA": { "GOERLI": "0xfea165cDEe7d818e896FDDf622faE71420877BDD" },
  "USDP": { "GOERLI": "0xBE307774aB1D0FBC60E77cC6fdED0A5ed75c801B" },
  "PAXG": { "GOERLI": "0x6351b954418E5bb7fbD23f8BaC850536e5e0Df93" },
  "SAND": { "GOERLI": "0x15C387B8d50bb14411750385476CB979CE3BeB27" },
  "SUSHI": { "GOERLI": "0x0171DE785445F5460AA864bEDfFf3082149DD4DE" }
};

const EXPLORER: { [key: string]: string } = {
  'GOERLI': 'https://goerli.etherscan.io'
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showToastError, setShowToastError] = useState(false);
  const [token, setToken]= useState('USDT');
  const [network, setNetwork] = useState('GOERLI');
  const [address, setAddress] = useState('');
  const [currentBalance, setCurrentBalance] = useState('0');
  const [hash, setHash] = useState('');

  const tokens = useMemo(() => TOKENS[network as keyof typeof TOKENS], [network]);

  useEffect(() => {
    const interval = setInterval(() => {
      api
        .get(`api/erc20/token-balance?token=${token}&network=${network}`)
        .then(response => setCurrentBalance(Number(response.data.balance).toFixed(0)))
        .catch(error => {
          console.error(error)
          setCurrentBalance('0');
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [token, network]);

  const onNetworkChange = useCallback((event: any) => {
    setCurrentBalance('0');
    setNetwork(event.target.value);
  }, []);

  const onTokenChange = useCallback((event: any) => {
    setCurrentBalance('0');
    setToken(event.target.value);
  }, []);

  const onAddressChange = useCallback((event: any) => {
    setAddress(event.target.value);
  }, []);

  const onSubmitFaucet = useCallback(() => {
    setLoading(true);
    api
      .post('api/erc20/faucet', { token, network, address })
      .then(response => {
        setHash(response.data.hash);
        setLoading(false);
        setShowToast(true);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
        setShowToastError(true);
      })
    
  }, [token, network, address]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Token Faucet Sparkminds</title>
        <meta name="description" content="Token Faucet" />
        <link rel="icon" href="/logo_new.png" />
      </Head>

      <main className={styles.main}>
        <Image src="/sm_logo.png" alt='Token Faucet Sparkminds' width={200} height={50} className="mb-5" />
        <div className="mb-5">
          Send testnet coins back, when you don&apos;t need them anymore: <strong>0x853a7e60371DB0de37F0f68f5e48eB47413640B4</strong>
        </div>
        
        
        <ToastContainer position="top-end" className="p-3">
          <Toast bg="success" onClose={() => setShowToast(false)} show={showToast}>
            <Toast.Header>
              <strong className="me-auto">Faucet Success</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              <a
                href={`${EXPLORER[network]}/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-white"
              >
                {hash}
              </a>
            </Toast.Body>
          </Toast>
          <Toast bg="danger" onClose={() => setShowToastError(false)} show={showToastError} delay={3000} autohide>
            <Toast.Body>Faucet Failed</Toast.Body>
          </Toast>
        </ToastContainer>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              Current wallet balance is {' '}
              {Number(currentBalance) === 0 ? (<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>) : <strong>{currentBalance}</strong>} {token}.
              You can get <strong>50</strong> {token}
            </Form.Label>
          </Form.Group>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formNetwork">
              <Form.Label>Network</Form.Label>
              <Form.Select placeholder="Choose network" defaultValue={network} onChange={onNetworkChange}>
                <option value='GOERLI'>Ethereum (Goerli)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="formToken">
              <Form.Label>Token</Form.Label>
              <Form.Select placeholder="Choose token" defaultValue={token} onChange={onTokenChange}>
                {tokens.map((token, index) => (<option key={index} value={token.value}>{token.label}</option>))}
              </Form.Select>
              <Form.Text>
                <a
                  href={`${EXPLORER[network]}/token/${CONTRACT_ADDRESSES[token][network]}`}
                  target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}
                >
                  View Contract
                </a>
            </Form.Text>
            </Form.Group>
          </Row>
          
          <Form.Group className="mb-3" controlId="formBasicAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" placeholder="Enter the address" defaultValue={address} onChange={onAddressChange}/>
          </Form.Group> 
          <Button
            variant="primary"
            type="button"
            className="mt-3"
            style={{ width: '100%' }}
            onClick={onSubmitFaucet}
            disabled={!ETH_ADDRESS_REGEXP.test(String(address)) || loading || Number(currentBalance) === 0}
          >
            {loading ? (<Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>) : null}
            {loading ? null : 'Faucet'}
          </Button>
        </Form>
      </main>
    </div>
  )
}
