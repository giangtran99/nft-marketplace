import React, { useContext, useEffect } from 'react';
import web3 from './connection/web3';
import Navbar from './components/Layout/Navbar';
import MintForm from './components/Content/MintNFT';
import CreateAlbumForm from './components/Content/CreateAlbum';
import Creator from './components/Content/CreatorList';
import CreatorInfo from './components/Content/CreatorInfo';
import AlbumNFT from './music-components/AlbumNFT';
import Main from './components/Content/Main';
import Footer from './components/Layout/Footer';
import Web3Context from './store/web3-context';
import CollectionContext from './store/collection-context';
import MarketplaceContext from './store/marketplace-context'
import NFTCollection from './abis/NFTCollection.json';
import NFTMarketplace from './abis/NFTMarketplace.json';
import { SwitchHorizontalIcon } from '@heroicons/react/outline';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import './App.css'
import UserInfo from './components/Content/UserInfo';
import EditUserInfo from './components/Content/Accounts/BaseView';
import NFTInfo from './components/Content/NFTInfo';
import AlbumInfo from './components/Content/AlbumInfo';
import Dashboard from './components/Content/Dashboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

const App = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);


  useEffect(() => {
    // Check if the user has Metamask active
    if (!web3) {
      toast.warning('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }

    // Function to fetch all the blockchain data
    const loadBlockchainData = async () => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error(error);
      }

      // Load account
      const account = await web3Ctx.loadAccount(web3);

      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);


      // Load Contracts      
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);

      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace, mktDeployedNetwork);
      console.log("@@mktContract", marketplaceCtx)
      if (nftContract) {
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply, null);
        // Event subscription
        nftContract.events.Transfer()
          .on('data', (event) => {
            collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
            collectionCtx.setNftIsLoading(false);
          })
          .on('error', (error) => {
            console.log(error);
          });

      } else {
        toast.warning('NFTCollection contract not deployed to detected network.')
      }

      if (mktContract) {
        // Load offer count
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract);

        // Load offers
        marketplaceCtx.loadOffers(mktContract, offerCount);

        // Load User Funds
        account && marketplaceCtx.loadUserFunds(mktContract, account);

        // Event OfferFilled subscription 
        mktContract.events.OfferFilled()
          .on('data', (event) => {
            marketplaceCtx.updateOffer(event.returnValues.offerId);
            collectionCtx.updateOwner(event.returnValues.id, event.returnValues.newOwner);
            marketplaceCtx.setMktIsLoading(false);
          })
          .on('error', (error) => {
            console.log(error);
          });

        // Event Offer subscription 
        mktContract.events.Offer()
          .on('data', (event) => {
            marketplaceCtx.addOffer(event.returnValues);
            marketplaceCtx.setMktIsLoading(false);
          })
          .on('error', (error) => {
            console.log(error);
          });

        // Event offerCancelled subscription 
        mktContract.events.OfferCancelled()
          .on('data', (event) => {
            marketplaceCtx.updateOffer(event.returnValues.offerId);
            collectionCtx.updateOwner(event.returnValues.id, event.returnValues.owner);
            marketplaceCtx.setMktIsLoading(false);
          })
          .on('error', (error) => {
            console.log(error);
          });

      } else {
        toast.warning('NFTMarketplace contract not deployed to detected network.')
      }

      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);

      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3);
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    };

    loadBlockchainData();
  }, []);

  const showNavbar = web3 && collectionCtx.contract && marketplaceCtx.contract;
  const showContent = web3 && collectionCtx.contract && marketplaceCtx.contract && web3Ctx.account;

  return (
    <React.Fragment>

      {showNavbar && <Navbar />}
      <Router>
        <div className="App">
          {/* Menu */}
          {/* Noi Dung */}
          <Routes>
            <Route exact path='/' element={showContent && <Main />} />
            <Route exact path='/mint' element={showContent && <MintForm />} />
            <Route exact path='/create-album' element={showContent && <CreateAlbumForm />} />
            <Route exact path='/creator' element={showContent && <Creator />} />
            <Route exact path='/creator/:id' element={showContent && <CreatorInfo />} />
            <Route exact path='/userinfo' element={showContent && localStorage.getItem('token') && <UserInfo />} />
            <Route exact path='/edit-user-info' element={showContent && localStorage.getItem('token') && <EditUserInfo />} />
            <Route exact path='/nft/:id' element={showContent && <NFTInfo />} />
            <Route exact path='/album/:id' element={showContent && <AlbumInfo />} />
            <Route exact path='/album' element={showContent && <AlbumNFT />} />
            <Route exact path='/dashboard' element={showContent && localStorage.getItem('token') && <Dashboard />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
      {showNavbar && <Footer />}
    </React.Fragment>
  );
};

export default App;