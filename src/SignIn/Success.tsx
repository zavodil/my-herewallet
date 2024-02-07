import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { isTgMobile } from "../env";
import Header from "../Home/Header";
import { Root } from "../Home/styled";
import fittext from "../Home/HOT/effects/fittext";

import { Formatter } from "../core/helpers";
import { useWallet } from "../core/Accounts";
import { Chain } from "../core/token/types";

import { colors } from "../uikit/theme";
import { BoldP } from "../uikit/typographic";
import { useNavigateBack } from "../useNavigateBack";
import { ActionButton, Button, H0, H2, H3, Text } from "../uikit";
import { CardSuccess, ContainerSuccess } from "./styled";
import {useIsWebAppReady, useTelegramWebApp, WebAppMainButton} from '@kloktunov/react-telegram-webapp';




const SignInSuccess = () => {
    const telegram = useTelegramWebApp();
    console.log("te", telegram)

  useNavigateBack();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useWallet()!;

  useEffect(() => {
    // @ts-ignore
    const [fit] = fittext("#balance", { maxSize: 56 });
    return () => fit.unsubscribe();
  }, []);

  const receiverId = params.get("receiverId");
    const account = useWallet()!;

  return (
    <Root>
      {!isTgMobile() && <Header />}

      <ContainerSuccess>
        <CardSuccess>
          <img style={{ width: 200, height: 290, objectFit: "cover" }} src={require("../assets/rock.png")} />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  width: 300,
                  textAlign: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <H3>


                      You have successfully
                      signed&nbsp;in to {receiverId}

                </H3>
              </div>



            </div>


              <WebAppMainButton text={"Continue"} onClick={()=>{ telegram?.sendData(JSON.stringify({account: account.id}));}} />





          </div>
        </CardSuccess>


      </ContainerSuccess>
    </Root>
  );
};

export default SignInSuccess;
