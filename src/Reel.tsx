// Copyright (c) 2023 Michael Kolesidis <michael.kolesidis@gmail.com>
// Licensed under the GNU Affero General Public License v3.0.
// https://www.gnu.org/licenses/gpl-3.0.html

import { useRef, forwardRef, ForwardedRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
// import useGame from "./stores/store";
import { WHEEL_SEGMENT } from "./utils/constants";
import urlReel from '../public/models/reel.glb'
import urlReel_0 from '../public/images/reel_0.png'
import urlReel_1 from '../public/images/reel_1.png'
import urlReel_2 from '../public/images/reel_2.png'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

type GLTFResult = GLTF & {
  nodes: {
    Cylinder: THREE.Mesh;
    Cylinder_1: THREE.Mesh;
  };
  materials: {
    ["Material.001"]: THREE.MeshStandardMaterial;
    ["Material.002"]: THREE.MeshStandardMaterial;
  };
};

type ReelProps = JSX.IntrinsicElements["group"] & {
  value?: number;
  reelSegment: number;
  map: number;
};

const Reel = forwardRef(
  (props: ReelProps, ref: ForwardedRef<THREE.Group>): JSX.Element => {
    // const sparkles = useGame((state) => state.sparkles);

    const { reelSegment } = props;
    //const { nodes, materials } = useGLTF("/models/reel.glb") as GLTFResult;
      //const texture = useLoader(THREE.TextureLoader, urReel)
      const { nodes, materials } = useLoader(GLTFLoader, urlReel)
       //const { nodes, materials } = useGLTF("/public/models/reel.glb") as GLTFResult;
     // const { nodes, materials } = useGLTF("../../public/models/reel.glb") as GLTFResult;
    const reel = useRef<THREE.Group>(null);

    // Color maps
    //const colorMap0 = useLoader(THREE.TextureLoader, "/images/reel_0.png");
      const colorMap0 = useLoader(THREE.TextureLoader, urlReel_0)
    //const colorMap1 = useLoader(THREE.TextureLoader, "/images/reel_1.png");
      const colorMap1 = useLoader(THREE.TextureLoader, urlReel_1)
    //const colorMap2 = useLoader(THREE.TextureLoader, "/images/reel_2.png");
      const colorMap2 = useLoader(THREE.TextureLoader, urlReel_2)
    let activeColorMap;
    switch (props.map) {
      case 0:
        activeColorMap = colorMap0;
        break;
      case 1:
        activeColorMap = colorMap1;
        break;
      case 2:
        activeColorMap = colorMap2;
        break;
    }

    useFrame(() => {
      if (reel.current) reel.current.rotation.x += 0.025;
    });

    return (
      <group {...props} ref={ref} dispose={null}>
        <group
          rotation={[reelSegment * WHEEL_SEGMENT - 0.2, 0, -Math.PI / 2]}
          scale={[1, 0.29, 1]}
        >
          <mesh castShadow receiveShadow geometry={nodes.Cylinder.geometry}>
            <meshStandardMaterial map={activeColorMap} />
            {/* {sparkles && (
              <Sparkles count={200} scale={2.5} size={10} speed={4} />
            )} */}
          </mesh>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cylinder_1.geometry}
            material={materials["Material.002"]}
          />
        </group>
      </group>
    );
  }
);

useGLTF.preload("/models/reel.glb");
export default Reel;
