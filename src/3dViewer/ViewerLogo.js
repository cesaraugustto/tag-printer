import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useFBX } from "@react-three/drei";
import { Suspense } from "react";
import { PerspectiveCamera } from '@react-three/drei';
import { useEffect, useRef } from 'react';

const Scene = () => {
    const fbx = useFBX("/Sinosteel3d.fbx");

    // Use useRef para criar uma referência à rotação horizontal
    const horizontalRotation = useRef(0);

    // Velocidade de rotação desejada (em radianos por quadro)
    const rotationSpeed = 0.02;

    // Ângulo máximo de rotação (em radianos)
    const maxRotation = Math.PI * 2; // Um círculo completo

    // Ajuste a escala do objeto para torná-lo mais visível
    if (fbx) {
        fbx.scale.set(0.5, 0.5, 0.5); // Ajuste a escala conforme necessário
    }

    // Use useEffect para atualizar a rotação horizontal
    useEffect(() => {
        const updateRotation = () => {
            // Aumente o ângulo de rotação horizontal
            horizontalRotation.current += rotationSpeed;

            // Limita a rotação dentro do ângulo máximo
            if (horizontalRotation.current > maxRotation) {
                horizontalRotation.current = 0; // Reinicia a rotação
            }

            // Aplique a rotação ao objeto apenas no eixo Z, mantendo os eixos X e Y inalterados
            if (fbx) {
                fbx.rotation.x = 0;
                fbx.rotation.y = 0;
                fbx.rotation.z = horizontalRotation.current;
            }
        };

        // Chame a função de atualização a cada quadro
        let frameId = requestAnimationFrame(function animate() {
            updateRotation();
            frameId = requestAnimationFrame(animate);
        });

        // Retorne uma função para limpar o pedido de quadro quando o componente é desmontado
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [fbx]);

    return <primitive object={fbx} position={[0, -5, 3]} />;
};

export default function App() {
    return (
        <div className="">
            <Canvas style={{ width: '100%', height: '200px' }}>
                <ambientLight intensity={1} />
                <directionalLight color="red" position={[10, 10, 10]} />
                <directionalLight color="blue" position={[10, 10, 10]} />
                <PerspectiveCamera makeDefault position={[0, 10, 1]} fov={50} near={0.1} far={1000} rotation={[0, 0, 0]} />

                <Suspense fallback={null}>
                    <Scene />
                    <OrbitControls />
                    <Environment preset="sunset"/>
                </Suspense>
            </Canvas>
        </div>
    );
}
