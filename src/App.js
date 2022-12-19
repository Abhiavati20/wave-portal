import { ethers } from "ethers";
import React, {useEffect, useState} from "react";
import './App.css';

import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async() => {
  try {
    const ethereum = getEthereumObject();
    if(!ethereum){
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have ethereum object : ", ethereum);
    const accounts = await ethereum.request({method:"eth_accounts"});

    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ",account);
      return account;
    }
    else {
      console.error("No account found");
      return null
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function App() {
  const [currentAccount,setCurrentAccount] = useState("");
  const [allWaves,setAllWaves] = useState([]);

  const [inputMessage,setInputMessage] = useState("");

  // contract address
  const contractAddress = "0xAf86E4070AA28CFCBc4016c8216597c1f6ea19E2"
  
  // abi content
  const contractABI  = abi.abi

  // connect or login with metamask
  const connectWallet = async() => {
    try {
      const ethereum = getEthereumObject();
      if(!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method:"eth_requestAccounts",
      });

      console.log("Connected",accounts[0]);
      setCurrentAccount(accounts[0]);
    }
    catch(error) {
      console.error(error);
    }
  }

  // call the functions from deployed smart contracts

  const getAllWaves = async() => {
    try {
      const ethereum = getEthereumObject();
      
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer);

        // call the get all waves method from smart contract

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address:wave.waver,
            timestamp:new Date(wave.timestamp*1000),
            message:wave.message
          });
        });

        // storing it into the state
        setAllWaves(wavesCleaned);
      }
      else{
        console.log("Ethereum Object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  const wave = async()=>{
    try {
      const ethereum = getEthereumObject();
      
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", Number(count));

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(inputMessage);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", Number(count));
      }
      else{
        console.log("Ethereum Object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(()=>{
    const fetchData = async()=>{
      const account = await findMetaMaskAccount();
      if(account!==null){
        setCurrentAccount(account);
      }
    }
    fetchData();
    getAllWaves();
  },[getAllWaves]);
  
  const handleInputMessageChange = e =>{
    setInputMessage(e.target.value);
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="wave">👋</span> Hey there!
        </div>

        <div className="bio">
        I am Abhishek and I am software engineer? Connect your Ethereum wallet and wave at me!
        </div>


        <div className="input">
          <input value={inputMessage} onChange={handleInputMessageChange} placeholder="Enter a message here" required/>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {
          allWaves.map((wave,index)=> {
            return (
              <div key={index} style={{background:"OldLace",marginTop:"16px",padding:"8px"}}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}
