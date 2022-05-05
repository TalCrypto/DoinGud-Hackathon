import axios from "axios";
import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";

export default function ItemImage({ id, readContracts }) {
  const metaURI = useContractReader(readContracts, "NFTCreativeItem", "uri", [id]);
  // const approvedAll = useContractReader(readContracts, "NFTCreativeItem", "isApprovedForAll", [
  //   address,
  //   readContracts.CollectionFactory?.address,
  // ]);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    async function get() {
      if (metaURI) {
        const res = await axios.get(
          String(metaURI).replace(
            "{id}",
            ("0000000000000000000000000000000000000000000000000000000000000000" + id.toString(16)).substr("-64"),
          ),
        );
        setMeta(res.data);
      }
    }
    get();
  }, [metaURI, id]);

  return meta ? (
    <>
      <img src={meta.image} style={{ width: "100%" }} alt={meta.name} />
      <p>{meta.name}</p>
      <p>{meta.description}</p>
    </>
  ) : null;
}
