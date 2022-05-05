pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./HunterNFT.sol";
import "./NFTCreativeItem.sol";

contract CollectionFactory is Ownable {

  using EnumerableSet for EnumerableSet.UintSet;

  event CollectionCreated(address nftAddress, string name, string symbol, string baseTokenURI);
  event NFTMinted(address indexed creator, address nftAddress, uint256 tokenId);

  //nft creative item id => nft contract
  mapping(uint256=>HunterNFT) public nftFactory;

  NFTCreativeItem public creativeItem;

  EnumerableSet.UintSet initedCreativeItemIds;

  constructor(NFTCreativeItem itemContract) {
    creativeItem = itemContract;
  }

  function createCollection(uint256 creativeItemId, string memory name, string memory symbol, string memory baseTokenURI) external onlyOwner {
    require(!initedCreativeItemIds.contains(creativeItemId), "can't initialize this item");
    initedCreativeItemIds.add(creativeItemId);
    nftFactory[creativeItemId] = new HunterNFT(name, symbol, baseTokenURI);
    emit CollectionCreated(address(nftFactory[creativeItemId]), name, symbol, baseTokenURI);
  }

  function mintHunter(uint256 itemId) external {
    require(initedCreativeItemIds.contains(itemId), "can't mint with this item");
    require(creativeItem.balanceOf(msg.sender, itemId) > 0, "don't have enough items");
    creativeItem.burn(msg.sender, itemId, 1);
    nftFactory[itemId].mint(msg.sender);
    uint256 tokenId = nftFactory[itemId].tokenByIndex(nftFactory[itemId].totalSupply()-1);
    emit NFTMinted(msg.sender, address(nftFactory[itemId]), tokenId);
  }

}