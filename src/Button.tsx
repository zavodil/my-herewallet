// Copyright (c) 2023 Michael Kolesidis <michael.kolesidis@gmail.com>
// Licensed under the GNU Affero General Public License v3.0.
// https://www.gnu.org/licenses/gpl-3.0.html

import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import urlButton from '../public/models/button.glb'
import {useLoader} from "@react-three/fiber";

type GLTFResult = GLTF & {
  nodes: {
    Cube_Subscribe_0: THREE.Mesh;
  };
};

const Button = (props: JSX.IntrinsicElements["group"]) => {
  // const { nodes } = useGLTF("/public/models/button.glb") as GLTFResult;
    const { nodes, materials } = useLoader(GLTFLoader, urlButton)

  const material = new THREE.MeshStandardMaterial({ color: "#3b0873" });

  return (
    <group {...props} dispose={null}>
      <group
        position={[713.17, 1157.193, -723.814]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[130.456, 19.364, 45.456]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_Subscribe_0.geometry}
          material={material}
          position={[-5.454, -37.484, -26.142]}
        ></mesh>
      </group>
    </group>
  );
};

useGLTF.preload("/models/button.glb");
//useGLTF.preload("../../public/models/reel.glb");
export default Button;
