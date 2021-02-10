const contract = require('@truffle/contract');

const FactoryJson = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const WETHJson = require('@uniswap/v2-periphery/build/WETH.json');
const RouterJson = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const LGERC20 = artifacts.require('LGERC20');

const UniswapV2Factory= contract(FactoryJson);
const WETH = contract(WETHJson);
const Router = contract(RouterJson);

UniswapV2Factory.setProvider(this.web3._provider);
WETH.setProvider(this.web3._provider);
Router.setProvider(this.web3._provider);

//const EVCoin = artifacts.require("EVCoin");
function tokens(n){
  return web3.utils.toWei(n,"ether");
}

module.exports = async function (deployer,_network, addresses) {
  //Deploy factory
  await deployer.deploy(UniswapV2Factory, addresses[0], {from: addresses[0]});
  const uniswapV2Factory = await UniswapV2Factory.deployed();

  //deploy weth
  await deployer.deploy(WETH,{from: addresses[0]});
  const weth = await WETH.deployed();

  //deploy router
  await deployer.deploy(Router,uniswapV2Factory.address,weth.address, {from:addresses[0]});
  const router = await Router.deployed();


  await deployer.deploy(
    LGERC20,
    tokens('1000'),
    tokens('10'),
    router.address,
    addresses[0],
    Date.now()+60,
    {from:addresses[0]});

  const lgerc20 = await LGERC20.deployed();
};

