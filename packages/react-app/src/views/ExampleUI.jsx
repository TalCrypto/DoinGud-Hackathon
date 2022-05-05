import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { utils, BigNumber } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance, Events, Item, SaleItem } from "../components";
import { useContractReader } from "eth-hooks";

export default function ExampleUI({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");
  const prodIds = useContractReader(readContracts, "NFTCreativeItem", "getProdutIds");
  console.log("prodIds---------------", prodIds);
  const [prods, setProds] = useState();
  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <h2 style={{ marginTop: 20 }}>My Items</h2>
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        {address && (
          <Item id={0} address={address} tx={tx} readContracts={readContracts} writeContracts={writeContracts} />
        )}
        {address && (
          <Item id={1} address={address} tx={tx} readContracts={readContracts} writeContracts={writeContracts} />
        )}
      </div>
      <h2 style={{ marginTop: 10 }}>Items on sale</h2>
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        {address &&
          Array.isArray(prodIds) &&
          prodIds
            .map(id => BigNumber.from(id).toNumber())
            .map(id => (
              <SaleItem
                prodId={id}
                address={address}
                tx={tx}
                readContracts={readContracts}
                writeContracts={writeContracts}
              />
            ))}
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <Events
        contracts={readContracts}
        contractName="CollectionCreator"
        eventName="NFTMinted"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />

      {/* <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 256 }}>
        <Card>
          Check out all the{" "}
          <a
            href="https://github.com/austintgriffith/scaffold-eth/tree/master/packages/react-app/src/components"
            target="_blank"
            rel="noopener noreferrer"
          >
            📦 components
          </a>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <div>
            There are tons of generic components included from{" "}
            <a href="https://ant.design/components/overview/" target="_blank" rel="noopener noreferrer">
              🐜 ant.design
            </a>{" "}
            too!
          </div>

          <div style={{ marginTop: 8 }}>
            <Button type="primary">Buttons</Button>
          </div>

          <div style={{ marginTop: 8 }}>
            <SyncOutlined spin /> Icons
          </div>

          <div style={{ marginTop: 8 }}>
            Date Pickers?
            <div style={{ marginTop: 2 }}>
              <DatePicker onChange={() => {}} />
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Slider range defaultValue={[20, 50]} onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Switch defaultChecked onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Progress percent={50} status="active" />
          </div>

          <div style={{ marginTop: 32 }}>
            <Spin />
          </div>
        </Card>
      </div> */}
    </div>
  );
}
