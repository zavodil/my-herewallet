// Copyright (c) 2023 Michael Kolesidis <michael.kolesidis@gmail.com>
// Licensed under the GNU Affero General Public License v3.0.
// https://www.gnu.org/licenses/gpl-3.0.html

import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
// import { Perf } from "r3f-perf";
import Lights from "./lights/Lights";
import SlotMachine from "./SlotMachine";

const Game = () => {
  const slotMachineRef = useRef();

  return (
    <>
      <color args={["#6b6661"]} attach="background" />
      {/* <Perf position="top-right" /> */}
      <OrbitControls enableDamping={true} enableZoom={false}  minAzimuthAngle={-0.45} maxAzimuthAngle ={0.45} minPolarAngle={1.5} maxPolarAngle={1.8} />
      <Lights />
      <SlotMachine ref={slotMachineRef} value={[1, 2, 3]} />
    </>
  );
};

export default Game;
