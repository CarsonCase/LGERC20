LGERC20
=======

An ERC20 token with built in Liquidity Generation Event functionality
---------------------------------------------------------------------

**What is an LGE?**

An LGE is a Liquidity Generation Event. It allows new ERC20 tokens to have liquidity on decentralized exchanges at launch so adopters can buy/ sell tokens before a substantial market forms naturally

**What exchange does LGERC20 Work with?**

Uniswap V2

Getting Started on a local chain
--------------------------------
run `npm i` to install dependancies  
run `truffle test` to run tests  
run `truffle migrate` to migrate to local chain  


Constructor Parameters
----------------------

* uint256: The supply of ERC20 tokens to be minted in the LGE
* uint256: The supply of ERC20 tokens to be minted to the devs at deployment
* address: The address of the UniswapV2Router02
* address: The receiver of the LGE's liquidity tokens. This can be the devs, or another contract
* uint256: The time the LGE ends (seconds since unix epoch)

**NOTE:** Javascript's Date.now() function returns _miliseconds_ since the unix epoch

I've deployed. Now what?
------------------------

Up until the end of the LGE that you specified in the constructor users can send ETH to the contract. It will take note of the users address and the ammount contributed.  

Once the LGE ends and the time is reached. Anyone can call the endLGE() function. This will send the contracts ETH and it's initial ERC20 supply to Uniswap  