"use client";

import { useState, useCallback } from "react";

export interface SliderProperty {
  key: string;
  label: string;
  type: "slider";
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  group: string;
}

export interface ColorProperty {
  key: string;
  label: string;
  type: "color";
  value: string;
  group: string;
}

export type TunerProperty = SliderProperty | ColorProperty;

type TunerValues = Record<string, number | string>;

interface DesignTunerProps {
  properties: TunerProperty[];
  values: TunerValues;
  onChange: (key: string, value: number | string) => void;
  onReset: () => void;
}

export function useDesignTuner(properties: TunerProperty[]) {
  const defaults = Object.fromEntries(properties.map((p) => [p.key, p.value]));
  const [values, setValues] = useState<TunerValues>(defaults);

  const onChange = useCallback((key: string, value: number | string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onReset = useCallback(() => {
    setValues(defaults);
  }, []);

  return { values, onChange, onReset };
}

export default function DesignTuner({
  properties,
  values,
  onChange,
  onReset,
}: DesignTunerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    const changed: Record<string, Record<string, string>> = {};
    for (const prop of properties) {
      if (values[prop.key] !== prop.value) {
        if (!changed[prop.group]) changed[prop.group] = {};
        const unit = prop.type === "slider" ? prop.unit : "";
        changed[prop.group][prop.label] = `${values[prop.key]}${unit}`;
      }
    }
    const raw: TunerValues = {};
    for (const prop of properties) {
      raw[prop.key] = values[prop.key];
    }
    const output = JSON.stringify({ summary: changed, raw }, null, 2);
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const groups = [...new Set(properties.map((p) => p.group))];
  if (activeGroup === null && groups.length > 0) {
    setActiveGroup(groups[0]);
  }

  const activeProps = properties.filter((p) => p.group === activeGroup);
  const changedKeys = properties.filter(
    (p) => values[p.key] !== p.value
  ).length;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] font-mono text-xs select-none"
      style={{ width: collapsed ? "auto" : 320 }}
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="bg-black text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800 cursor-pointer"
        >
          Tuner {changedKeys > 0 && `(${changedKeys})`}
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="font-bold text-[11px] uppercase tracking-wide text-gray-500">
              Design Tuner
            </span>
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${
                  copied
                    ? "bg-green-200 text-green-800"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {copied ? "Copied!" : "Save"}
              </button>
              <button
                onClick={onReset}
                className="px-2 py-0.5 text-[10px] bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="px-2 py-0.5 text-[10px] bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
              >
                —
              </button>
            </div>
          </div>

          {/* Group Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {groups.map((group) => {
              const groupChanged = properties.filter(
                (p) => p.group === group && values[p.key] !== p.value
              ).length;
              return (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`px-3 py-1.5 text-[10px] whitespace-nowrap border-b-2 cursor-pointer ${
                    activeGroup === group
                      ? "border-black text-black font-bold"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {group} {groupChanged > 0 && `(${groupChanged})`}
                </button>
              );
            })}
          </div>

          {/* Properties */}
          <div className="max-h-64 overflow-y-auto">
            {activeProps.map((prop) => {
              const changed = values[prop.key] !== prop.value;

              if (prop.type === "color") {
                return (
                  <div
                    key={prop.key}
                    className={`px-3 py-1.5 border-b border-gray-100 ${
                      changed ? "bg-yellow-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-gray-600">{prop.label}</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={values[prop.key]}
                          onChange={(e) => onChange(prop.key, e.target.value)}
                          className="w-[70px] text-right bg-transparent border border-gray-200 rounded px-1 py-0 text-[11px]"
                        />
                        <input
                          type="color"
                          value={values[prop.key] as string}
                          onChange={(e) => onChange(prop.key, e.target.value)}
                          className="w-6 h-5 rounded border border-gray-200 cursor-pointer p-0"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={prop.key}
                  className={`px-3 py-1.5 border-b border-gray-100 ${
                    changed ? "bg-yellow-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-gray-600">{prop.label}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={values[prop.key] as number}
                        onChange={(e) =>
                          onChange(prop.key, parseFloat(e.target.value) || 0)
                        }
                        step={prop.step}
                        min={prop.min}
                        max={prop.max}
                        className="w-14 text-right bg-transparent border border-gray-200 rounded px-1 py-0 text-[11px]"
                      />
                      <span className="text-gray-400 w-6">{prop.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    value={values[prop.key] as number}
                    onChange={(e) =>
                      onChange(prop.key, parseFloat(e.target.value))
                    }
                    min={prop.min}
                    max={prop.max}
                    step={prop.step}
                    className="w-full h-1 accent-black"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
