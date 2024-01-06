import styled from "styled-components";

export const GlobalStyles = styled.div`
  body,
  html {
    margin: 0;
    padding: 0;
    background-color: transparent !important;
  }

  a {
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
    text-decoration-line: underline;
    color: #fd84e3;
  }

  *::-webkit-scrollbar {
    display: none;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

/*
  .here-connector {
    backdrop-filter: blur(4px);
    opacity: 1;
    visibility: visible;
    transition: visibility linear, opacity 0.25s;
    justify-content: center;
    align-items: center;
    font-family: Manrope, sans-serif;
    z-index: 10000;
    display: flex;

    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .here-connector-overlay {
    position: absolute;
    background: hwb(0 0% 100% / 0.2);
    height: 100%;
    width: 100%;
  }

  .here-connector-close-button {
    position: absolute;
    top: 32px;
    right: 32px;
    height: 32px;
    width: 32px;
    padding: 0;
  }

  .here-connector-text {
    padding: 0 12px;
    position: absolute;
    top: 32px;
    left: 32px;
  }

  .here-connector-option {
    position: absolute;
    top: 50%;
    opacity: 0.7;
    margin-top: -130px;
    padding: 8px;
    border-radius: 12px;
    border: 1px solid var(--Stroke);
    aspect-ratio: 1 / 1;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transform: scale(0.8);
    transition: 1s opacity;
  }

  .here-connector-option:hover {
    opacity: 1;
  }

  .here-connector-close-button,
  .here-connector-text {
    font-family: "Manrope";
    font-style: normal;
    font-weight: bolder;
    font-size: 16px;
    color: #2c3034;

    border: none;
    margin: 0;
    outline: none;
    cursor: pointer;
    height: 32px;
    background-color: #ebdedc;
    border-radius: 50px;
    justify-content: center;
    align-items: center;
    display: flex;

    transition: 0.2s opacity;
  }

  .here-connector-close-button:hover,
  .here-connector-text:hover {
    opacity: 0.7;
  }

  .here-connector-switch {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #c7bab8;
    cursor: pointer;
    border-radius: 24px;
    padding: 8px 12px;
    width: fit-content;
  }

  .here-connector-switch-wrap {
    display: flex;
    gap: 16px;
    position: absolute;
    top: 28px;
    left: 28px;
  }

  .here-connector-switch:hover {
    background-color: #ebdedc;
  }

  .here-connector-content {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: absolute;
    overflow: hidden;

    max-width: 812px;
    height: 524px;
    width: 100%;
    padding: 96px 20px 32px;
    gap: 32px;
    left: 50%;
    transform: translate(-50%);
    border: 1px solid #2c3034;

    background: #f3ebea;
    border-radius: 24px;
    font-size: 16px;
    line-height: 1.6;
    transition: visibility linear, opacity 0.25s;
  }

  .here-connector-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    aspect-ratio: 1 / 1;
    height: 100%;
    position: relative;
  }

  .here-connector-card {
    max-height: 256px;
    max-width: 256px;
    width: 100% !important;
    height: 100% !important;
    background: #ebdedc;
    border: 1px solid #2c3034;
    border-radius: 16px;
    justify-content: center;
    align-items: center;
    margin: auto;
    padding: 16px;
    display: flex;
    position: absolute;
    box-shadow: 8px 8px #2c3034;
  }

  .here-connector-footer {
    margin-top: 24px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: flex;
  }

  .here-connector-links {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .here-connector-footer a {
    display: inline-flex;
    text-decoration: none;
  }

  .here-connector-links {
    width: 100%;
    max-width: 336px;
  }

  .here-connector-links a {
    flex: 1;
    max-height: 48px;
    background: #100f0d;
    border-radius: 12px;
    padding: 4px;
    transition: 0.2s opacity;
  }

  .here-connector-links a:hover {
    opacity: 0.7;
  }

  .here-connector-links img {
    width: 100%;
  }

  .here-connector-footer p {
    text-align: center;
    margin-bottom: 0;
  }

  .here-connector-footer > img {
    position: absolute;
    height: 180px;
    bottom: 0;
    right: 32px;
  }

  .here-connector-footer > img:first-child {
    left: 32px;
  }

  .here-connector-approve {
    display: none;
    border: none;
    outline: 0;
    padding: 0;
    margin: 0 auto 16px;
    cursor: pointer;

    font-size: 1em;
    font-weight: bolder;
    flex-shrink: 0;
    width: 100%;
    height: 48px;
    max-width: 336px;
    border-radius: 12px;

    transition: 0.2s opacity;
    background: #2c3034;
    color: #fff;

    align-items: center;
    justify-content: center;
  }

  .here-connector-approve:hover {
    opacity: 0.7;
  }

  .here-connector-approve.disabled {
    cursor: default;
    opacity: 0.7;
  }

  @media (max-width: 575px) {
    .here-connector-content {
      bottom: 0;
      height: 500px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border: none;
      padding-top: 0px;
    }

    .here-connector-text {
      top: 16px;
      left: 16px;
    }

    .here-connector-footer > img {
      display: none;
    }

    .here-connector-wrap {
      margin-top: 32px;
      margin-bottom: -16px;
    }

    .here-connector-close-button {
      top: 16px;
      right: 16px;
    }

    .here-connector-approve {
      display: flex;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .loading-spin {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }

  .loading-spin div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 4px solid #333;
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #333 transparent transparent transparent;
  }

  .loading-spin div:nth-child(1) {
    animation-delay: -0.45s;
  }

  .loading-spin div:nth-child(2) {
    animation-delay: -0.3s;
  }

  .loading-spin div:nth-child(3) {
    animation-delay: -0.15s;
  }

  .snap-card {
    flex-direction: column;
    cursor: pointer;
  }

  .snap-card img {
    transition: 0.2s transform;
  }

  .snap-card:hover img {
    transform: scale(1.1);
  }
`;
*/
