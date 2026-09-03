"use client";

import React from "react";

import { PRESET_DESCRIPTIONS } from "../../../visual/scenes/spintronics/spintronics-config";
import type { SpintronicsColorMap, SpintronicsMode } from "../../../visual/state/scene-contract";
import { useSceneStore } from "../../../visual/state/scene-store";
import styles from "./spintronics-controls.module.css";

const PRESETS: Array<{ id: SpintronicsMode; label: string; badge: string }> = [
  { id: "skyrmion-neel", label: "Néel Skyrmion", badge: "Q = -1" },
  { id: "skyrmion-bloch", label: "Bloch Skyrmion", badge: "Q = -1" },
  { id: "vortex", label: "Magnetic Vortex", badge: "Q = +½" },
  { id: "spin-wave", label: "Curved Spin Waves", badge: "Continuum" },
  { id: "caustic-lens", label: "Caustic Lens", badge: "Focus" },
];

const COLOR_MAPS: Array<{ id: SpintronicsColorMap; label: string }> = [
  { id: "hsl-cone", label: "MMPP HSL Cone (+z biały, -z czarny)" },
  { id: "zelent-prb", label: "Zelent Spectrum (PRB/RRL)" },
  { id: "racetrack", label: "Racetrack (Red-Core)" },
  { id: "chiral", label: "Chiral Editorial" },
  { id: "topological", label: "Topological q(r)" },
  { id: "magnetization", label: "Magnetization mz" },
];

export function SpintronicsControls({ className }: { className?: string } = {}) {
  const physics = useSceneStore((state) => state.spintronicsPhysics);
  const setPhysics = useSceneStore((state) => state.setSpintronicsPhysics);
  const diagnostics = useSceneStore((state) => state.diagnostics);

  const activePresetInfo = PRESET_DESCRIPTIONS[physics.mode];

  // Live theoretical energy estimation (normalized relative a.u.)
  const dmiVal = -(physics.dmiStrength * 2.4);
  const zeemanVal = -(physics.magneticField * 0.045);
  const totalVal = dmiVal + zeemanVal + 3.8;
  const dmiEnergy = dmiVal.toFixed(2);
  const zeemanEnergy = zeemanVal.toFixed(2);
  const totalEnergy = totalVal.toFixed(2);

  return (
    <div
      className={`${styles.container} ${className || ""}`}
      data-testid="spintronics-controls"
      suppressHydrationWarning
    >
      {/* Live Physics HUD Banner */}
      <div className={styles.hudRow}>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Topological Invariant</span>
          <span className={styles.hudValueAccent}>{activePresetInfo.topology}</span>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Total Energy (a.u.)</span>
          <span className={styles.hudValue}>{totalEnergy} pJ</span>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Zeeman Energy</span>
          <span className={styles.hudValue}>{zeemanEnergy} pJ</span>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Rendering Rate</span>
          <span className={styles.hudValueHighlight}>
            {diagnostics.p50Ms > 0 ? `${Math.round(1000 / diagnostics.p50Ms)} FPS` : "60 FPS"}
          </span>
        </div>
      </div>

      {/* Preset Selector */}
      <div className={styles.sectionBlock}>
        <span className={styles.sectionTitle}>Physical Phenomenon Presets</span>
        <div className={styles.presetButtons} role="tablist" aria-label="Physical phenomenon presets">
          {PRESETS.map((preset) => {
            const isActive = physics.mode === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setPhysics({ mode: preset.id })}
                className={`${styles.presetBtn} ${isActive ? styles.presetBtnActive : ""}`}
              >
                <span className={styles.presetLabel}>{preset.label}</span>
                <span className={styles.presetBadge}>{preset.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Parameters Sliders Grid */}
      <div className={styles.slidersGrid}>
        {/* B_z Field */}
        <div className={styles.sliderCard}>
          <div className={styles.sliderHeader}>
            <label htmlFor="field-bz" className={styles.sliderLabel}>
              External Field (B<sub>z</sub>)
            </label>
            <span className={styles.sliderValue}>{physics.magneticField} mT</span>
          </div>
          <input
            id="field-bz"
            type="range"
            min="-150"
            max="150"
            step="5"
            value={physics.magneticField}
            onChange={(e) => setPhysics({ magneticField: Number(e.target.value) })}
            className={styles.sliderInput}
            aria-valuemin={-150}
            aria-valuemax={150}
            aria-valuenow={physics.magneticField}
            aria-label="External magnetic field Bz"
            suppressHydrationWarning
          />
          <span className={styles.sliderHint}>Shrinks / expands the central topological domain core</span>
        </div>

        {/* DMI Strength */}
        <div className={styles.sliderCard}>
          <div className={styles.sliderHeader}>
            <label htmlFor="dmi-strength" className={styles.sliderLabel}>
              Interfacial DMI (D)
            </label>
            <span className={styles.sliderValue}>{physics.dmiStrength.toFixed(1)} mJ/m²</span>
          </div>
          <input
            id="dmi-strength"
            type="range"
            min="0.0"
            max="3.5"
            step="0.1"
            value={physics.dmiStrength}
            onChange={(e) => setPhysics({ dmiStrength: Number(e.target.value) })}
            className={styles.sliderInput}
            aria-valuemin={0}
            aria-valuemax={3.5}
            aria-valuenow={physics.dmiStrength}
            aria-label="Dzyaloshinskii-Moriya Interaction constant"
            suppressHydrationWarning
          />
          <span className={styles.sliderHint}>Controls chiral wall rotation and skyrmion stability</span>
        </div>

        {/* RF Microwave Frequency */}
        <div className={styles.sliderCard}>
          <div className={styles.sliderHeader}>
            <label htmlFor="rf-frequency" className={styles.sliderLabel}>
              Microwave Frequency (f)
            </label>
            <span className={styles.sliderValue}>{physics.rfFrequency.toFixed(1)} GHz</span>
          </div>
          <input
            id="rf-frequency"
            type="range"
            min="2.0"
            max="20.0"
            step="0.2"
            value={physics.rfFrequency}
            onChange={(e) => setPhysics({ rfFrequency: Number(e.target.value) })}
            className={styles.sliderInput}
            aria-valuemin={2}
            aria-valuemax={20}
            aria-valuenow={physics.rfFrequency}
            aria-label="RF Microwave Excitation Frequency"
            suppressHydrationWarning
          />
          <span className={styles.sliderHint}>Modulates spin-wave dispersion wavelength λ</span>
        </div>

        {/* Gilbert Damping */}
        <div className={styles.sliderCard}>
          <div className={styles.sliderHeader}>
            <label htmlFor="damping-alpha" className={styles.sliderLabel}>
              Gilbert Damping (α)
            </label>
            <span className={styles.sliderValue}>{physics.dampingAlpha.toFixed(3)}</span>
          </div>
          <input
            id="damping-alpha"
            type="range"
            min="0.001"
            max="0.050"
            step="0.001"
            value={physics.dampingAlpha}
            onChange={(e) => setPhysics({ dampingAlpha: Number(e.target.value) })}
            className={styles.sliderInput}
            aria-valuemin={0.001}
            aria-valuemax={0.05}
            aria-valuenow={physics.dampingAlpha}
            aria-label="Gilbert damping parameter alpha"
            suppressHydrationWarning
          />
          <span className={styles.sliderHint}>Governs dissipation and spatial wave decay length</span>
        </div>
      </div>

      {/* Visualization Settings & Vector Field Toggle */}
      <div className={styles.optionsRow}>
        <div className={styles.colorMapGroup}>
          <span className={styles.groupTitle}>Color Shader Mapping:</span>
          {COLOR_MAPS.map((cm) => (
            <button
              key={cm.id}
              type="button"
              onClick={() => setPhysics({ colorMap: cm.id })}
              className={`${styles.colorMapBtn} ${physics.colorMap === cm.id ? styles.colorMapBtnActive : ""}`}
              aria-pressed={physics.colorMap === cm.id}
            >
              {cm.label}
            </button>
          ))}
        </div>

        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={physics.showVectorField}
            onChange={(e) => setPhysics({ showVectorField: e.target.checked })}
            className={styles.checkboxInput}
            suppressHydrationWarning
          />
          <span>Show 3D Vector Moment Field</span>
        </label>
      </div>

      {/* Description of current phenomenon */}
      <div className={styles.theoryBox}>
        <div className={styles.theoryHeader}>
          <strong>{activePresetInfo.name}</strong>
          <span className={styles.mechanismBadge}>{activePresetInfo.mechanism}</span>
        </div>
        <p className={styles.theoryText}>{activePresetInfo.description}</p>
        <code className={styles.theoryFormula}>{activePresetInfo.equation}</code>
      </div>
    </div>
  );
}
