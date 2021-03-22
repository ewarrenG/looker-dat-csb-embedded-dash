import React, { useState, useEffect, useContext, useRef } from "react";
import { Looker40SDK, DefaultSettings } from "@looker/sdk";
import { LookerEmbedSDK } from "@looker/embed-sdk";
import { PblSessionEmbed } from "./pblsession";
import "./styles.css";

export default function App() {
  const [accessToken, setAccessToken] = useState(undefined);
  const [sdk, setSdk] = useState(undefined);
  const [dashboardEmbedded, setDashboardEmbedded] = useState(false);

  // fetch token onload
  useEffect(() => {
    const fetchData = async () => {
      await fetch(
        "https://us-central1-pbl-demo-2020-281322.cloudfunctions.net/retrieve-access-token-node-data-dev-looker"
      )
        .then((response) => response.json())
        .then((data) => {
          setAccessToken(data);
        });
    };
    fetchData();
  }, []);

  //initiate pbl session after retrieving token
  useEffect(() => {
    if (accessToken) {
      const pblsession = new PblSessionEmbed({
        ...DefaultSettings(),
        base_url: `https://dat.dev.looker.com:19999`,
        accessToken
      });

      let sdk = new Looker40SDK(pblsession);
      setSdk(sdk);
    }
  }, [accessToken]);

  //embed dashboard
  useEffect(() => {
    if (sdk && !dashboardEmbedded) {
      createUrlAndEmbedDashboard();
    }
  }, [sdk]);

  let createUrlAndEmbedDashboard = async () => {
    const embed_url = await sdk.ok(
      sdk.create_embed_url_as_me({
        target_url: `https://dat.dev.looker.com/embed/dashboards-next/19?embed_domain=${document.location.origin}&sdk=2`
      })
    );

    LookerEmbedSDK.init("https://dat.dev.looker.com");
    LookerEmbedSDK.createDashboardWithUrl(embed_url.url)
      .appendTo(document.getElementById("App"))
      .withClassName("embeddedDashboard")
      .build()
      .connect()
      .then((dashboard) => {
        setDashboardEmbedded(true);
      });
  };

  return <div className="App"></div>;
}
