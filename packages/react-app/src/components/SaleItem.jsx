import { Button, Card } from "antd";
import axios from "axios";
import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";
import ItemImage from "./ItemImage";
const { ethers } = require("ethers");

export default function SaleItem({ prodId, address, tx, readContracts, writeContracts }) {
  const prodInfo = useContractReader(readContracts, "NFTCreativeItem", "products", [prodId]);
  const [id, setId] = useState(null);
  console.log("prodInfo", prodInfo);
  console.log("id", id);

  useEffect(() => {
    if (prodInfo) {
      setId(ethers.BigNumber.from(prodInfo.tokenId).toNumber());
    }
  }, [prodInfo]);

  return prodInfo && id !== null ? (
    <Card style={{ margin: 10, padding: 10, width: 300 }}>
      <ItemImage id={id} readContracts={readContracts} />
      <p>
        <b>Price</b>: {ethers.utils.formatEther(prodInfo.price)} ETH
      </p>
      <p>
        <b>Amount</b>: {ethers.BigNumber.from(prodInfo.amount).toNumber()}
      </p>
      <Button
        onClick={async () => {
          if (address === prodInfo.seller) {
            tx(writeContracts.NFTCreativeItem.cancelSale(prodId));
          } else {
            tx(
              writeContracts.NFTCreativeItem.buy(prodId, 1, {
                value: prodInfo.price,
              }),
            );
          }
        }}
      >
        {address === prodInfo.seller ? "Cancel" : "Buy"}
      </Button>
    </Card>
  ) : null;
}
