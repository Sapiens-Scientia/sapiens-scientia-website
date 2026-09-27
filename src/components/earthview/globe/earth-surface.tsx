"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { ThemeMode } from "@/components/earthview/contexts";

// Shared surface processing and sunlight shading for the atlas and EarthView.
export function EarthTexture({ isDark, theme, rotationOffset = 0 }: { isDark: boolean; theme: ThemeMode; rotationOffset?: number }) {
    const surfaceTexture = useLoader(THREE.TextureLoader, '/earth-blue-marble-5400x2700.jpg')

    const displayTexture = useMemo(() => {
        const image = surfaceTexture.image as HTMLImageElement | undefined
        const fallback = () => {
            const texture = surfaceTexture.clone()
            texture.colorSpace = THREE.SRGBColorSpace
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.ClampToEdgeWrapping
            texture.anisotropy = 8
            return texture
        }
        if (!image || typeof document === 'undefined') return fallback()

        const canvas = document.createElement('canvas')
        const width = image.naturalWidth || image.width
        const height = image.naturalHeight || image.height
        if (!width || !height) return fallback()

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return fallback()

        ctx.drawImage(image, 0, 0, width, height)
        const imageData = ctx.getImageData(0, 0, width, height)
        const { data } = imageData

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const oceanStrength = Math.max(0, b - Math.max(r, g)) / 255
            const globalLift = isDark ? 24 : theme === 'sepia' ? 28 : 32
            const oceanLift = (isDark ? 68 : theme === 'sepia' ? 76 : 82) * oceanStrength
            const saturationLift = 1 + (isDark ? 0.1 : theme === 'sepia' ? 0.12 : 0.08) + oceanStrength * (isDark ? 0.26 : theme === 'sepia' ? 0.3 : 0.24)

            data[i] = Math.min(255, (r + globalLift + oceanLift * 0.28) * saturationLift)
            data[i + 1] = Math.min(255, (g + globalLift + oceanLift * 0.62) * saturationLift)
            data[i + 2] = Math.min(255, (b + globalLift + oceanLift) * saturationLift)
        }

        ctx.putImageData(imageData, 0, 0)
        const processedTexture = new THREE.CanvasTexture(canvas)
        processedTexture.colorSpace = THREE.SRGBColorSpace
        processedTexture.wrapS = THREE.RepeatWrapping
        processedTexture.wrapT = THREE.ClampToEdgeWrapping
        processedTexture.anisotropy = 8
        processedTexture.needsUpdate = true
        return processedTexture
    }, [surfaceTexture, isDark, theme])

    useEffect(() => () => {
        displayTexture.dispose()
    }, [displayTexture])

    return (
        <mesh rotation={[0, rotationOffset, 0]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial map={displayTexture} toneMapped={false} color="#ffffff" />
        </mesh>
    )
}

const nightVertexShader = `
    varying vec3 vNormal;

    void main() {
        vNormal = normalize(normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const nightFragmentShader = `
    uniform vec3 uSunDirection;
    uniform float uNightOpacity;
    varying vec3 vNormal;

    void main() {
        vec3 normal = normalize(vNormal);
        float sunDot = dot(normal, uSunDirection);
        float nightFactor = 1.0 - smoothstep(-0.105, 0.035, sunDot);
        vec3 nightColor = vec3(0.01, 0.015, 0.06);
        float terminatorGlow = smoothstep(-0.105, -0.02, sunDot) * (1.0 - smoothstep(-0.005, 0.07, sunDot));
        float atmosphereRim = smoothstep(-0.18, -0.04, sunDot) * (1.0 - smoothstep(0.005, 0.11, sunDot));
        vec3 glowColor = vec3(1.0, 0.6, 0.15);
        vec3 atmosColor = vec3(0.45, 0.65, 1.0);
        vec3 color = nightColor * nightFactor + glowColor * terminatorGlow * 0.08 + atmosColor * atmosphereRim * 0.15;
        float alpha = nightFactor * uNightOpacity + terminatorGlow * 0.12 + atmosphereRim * 0.08;
        gl_FragColor = vec4(color, alpha);
    }
`

export function NightOverlay({ isDark, sunDirection }: { isDark: boolean; sunDirection: THREE.Vector3 }) {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const sunDirectionRef = useRef(sunDirection.clone())
    const nightOpacityRef = useRef(isDark ? 0.82 : 0.65)
    const uniforms = useMemo(() => ({
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
        uNightOpacity: { value: 0.82 },
    }), [])

    useEffect(() => {
        sunDirectionRef.current.copy(sunDirection)
        if (materialRef.current) {
            materialRef.current.uniforms.uSunDirection.value.copy(sunDirection)
        }
    }, [sunDirection])

    useEffect(() => {
        nightOpacityRef.current = isDark ? 0.82 : 0.65
        if (materialRef.current) {
            materialRef.current.uniforms.uNightOpacity.value = nightOpacityRef.current
        }
    }, [isDark])

    useFrame(() => {
        if (!materialRef.current) return
        materialRef.current.uniforms.uSunDirection.value.copy(sunDirectionRef.current)
        materialRef.current.uniforms.uNightOpacity.value = nightOpacityRef.current
    })

    return (
        <mesh>
            <sphereGeometry args={[1.002, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={nightVertexShader}
                fragmentShader={nightFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                side={THREE.FrontSide}
            />
        </mesh>
    )
}
