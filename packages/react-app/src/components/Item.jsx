import { Button, Card, Input } from "antd";
import Text from "antd/lib/typography/Text";
import axios from "axios";
import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";
import ItemImage from "./ItemImage";
const { ethers } = require("ethers");

export default function Item({ id, address, tx, readContracts, writeContracts }) {
  const balance = useContractReader(readContracts, "NFTCreativeItem", "balanceOf", [address, id]);
  const approved = useContractReader(readContracts, "NFTCreativeItem", "isApprovedForAll", [
    address,
    readContracts.CollectionCreator.address,
  ]);
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState(0);

  const handleAmountChange = event => {
    const val = parseInt(event.target.value);
    if (val <= ethers.BigNumber.from(balance).toNumber()) {
      setAmount(val);
    } else {
      setAmount(0);
    }
  };

  const handlePriceChange = event => {
    setPrice(event.target.value);
  };

  // const metaURI = useContractReader(readContracts, "NFTCreativeItem", "uri", [id]);
  // const approvedAll = useContractReader(readContracts, "NFTCreativeItem", "isApprovedForAll", [
  //   address,
  //   readContracts.CollectionCreator?.address,
  // ]);
  // const [meta, setMeta] = useState(null);

  // useEffect(() => {
  //   async function get() {
  //     if (metaURI) {
  //       const res = await axios.get(String(metaURI).replace("{id}", id));
  //       console.log("asdfasdfasdfasdfasd", res);
  //       setMeta(res.data);
  //     }
  //   }
  //   get();
  // }, [metaURI]);

  return balance && ethers.BigNumber.from(balance).toNumber() > 0 ? (
    <Card style={{ margin: 10, padding: 10, width: 300 }}>
      <ItemImage id={id} readContracts={readContracts} />
      <p>
        <b>Balance</b>: {ethers.BigNumber.from(balance).toNumber()}
      </p>
      <Button
        disabled={!balance || ethers.BigNumber.from(balance).toNumber() === 0}
        onClick={async () => {
          if (!approved) {
            const apx = tx(
              writeContracts.NFTCreativeItem.setApprovalForAll(writeContracts.CollectionCreator.address, "true"),
            );
            await apx;
          }
          tx(writeContracts.CollectionCreator.mintHunter(id));
        }}
      >
        Mint Hunter NFT
      </Button>
      <div style={{ display: "flex", alignItems: "center",  marginTop: 5}}>
        Amount:&nbsp;
        <Input value={amount} onChange={handleAmountChange} />
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 5 }}>
        Price:&nbsp;
        <Input value={price} onChange={handlePriceChange} />
      </div>
      <Button
        style={{ marginTop: 5 }}
        disabled={!balance || ethers.BigNumber.from(balance).toNumber() === 0}
        onClick={async () => {
          if (!(amount > 0 && price > 0)) return;
          const data = ethers.utils.defaultAbiCoder.encode(["uint256"], [ethers.utils.parseEther(price)]);
          const apx = tx(
            writeContracts.NFTCreativeItem.safeTransferFrom(
              address,
              writeContracts.NFTCreativeItem.address,
              id,
              amount,
              data,
            ),
          );
          await apx;
        }}
      >
        Put on sale
      </Button>
    </Card>
  ) : null;
}
