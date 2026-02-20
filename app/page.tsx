/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast } from "@/components/ui/toast";

type Strength = "very-weak" | "weak" | "medium" | "strong" | "very-strong";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/|~";
const SIMILAR = "0O1lI";
const AMBIGUOUS = "{}[]()/\\'\"`~,;:.<>";

function calculateStrength(password: string): Strength {
  if (!password) return "very-weak";

  let score = 0;

  const length = password.length;
  if (length >= 20) score += 3;
  else if (length >= 14) score += 2;
  else if (length >= 10) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "very-weak";
  if (score <= 3) return "weak";
  if (score <= 5) return "medium";
  if (score <= 6) return "strong";
  return "very-strong";
}

function getStrengthLabel(strength: Strength) {
  switch (strength) {
    case "very-weak":
      return "极弱";
    case "weak":
      return "较弱";
    case "medium":
      return "一般";
    case "strong":
      return "较强";
    case "very-strong":
      return "极强";
  }
}

function getStrengthBar(strength: Strength) {
  switch (strength) {
    case "very-weak":
      return { segments: 1, color: "bg-red-500" };
    case "weak":
      return { segments: 2, color: "bg-orange-500" };
    case "medium":
      return { segments: 3, color: "bg-yellow-500" };
    case "strong":
      return { segments: 4, color: "bg-green-500" };
    case "very-strong":
      return { segments: 5, color: "bg-emerald-500" };
  }
}

export default function Home() {
  const [length, setLength] = useState(16);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const { strength, strengthLabel, strengthBar } = useMemo(() => {
    const s = calculateStrength(password);
    return {
      strength: s,
      strengthLabel: getStrengthLabel(s),
      strengthBar: getStrengthBar(s),
    };
  }, [password]);

  const buildCharset = useCallback(() => {
    let chars = "";
    if (includeLowercase) chars += LOWERCASE;
    if (includeUppercase) chars += UPPERCASE;
    if (includeNumbers) chars += NUMBERS;
    if (includeSymbols) chars += SYMBOLS;

    if (!chars) return "";

    if (excludeSimilar) {
      chars = chars
        .split("")
        .filter((ch) => !SIMILAR.includes(ch))
        .join("");
    }
    if (excludeAmbiguous) {
      chars = chars
        .split("")
        .filter((ch) => !AMBIGUOUS.includes(ch))
        .join("");
    }

    return chars;
  }, [
    includeLowercase,
    includeUppercase,
    includeNumbers,
    includeSymbols,
    excludeSimilar,
    excludeAmbiguous,
  ]);

  const generatePassword = useCallback(() => {
    const charset = buildCharset();
    if (!charset) {
      setPassword("");
      return;
    }

    const targetLength = Math.max(4, Math.min(128, length));
    const array = new Uint32Array(targetLength);

    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < targetLength; i += 1) {
        array[i] = Math.floor(Math.random() * 0xffffffff);
      }
    }

    let result = "";
    for (let i = 0; i < targetLength; i += 1) {
      const index = array[i] % charset.length;
      result += charset[index]!;
    }

    setPassword(result);
    setCopied(false);
  }, [buildCharset, length]);

  useEffect(() => {
    generatePassword();
  }, []);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setToastOpen(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleLengthInput = (value: string) => {
    const n = Number(value.replace(/\D/g, ""));
    if (Number.isNaN(n)) return;
    setLength(Math.min(128, Math.max(4, n)));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>密码生成器</CardTitle>
          <CardDescription>
            使用高强度随机算法生成安全密码，支持自定义长度与字符集，一键复制使用。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="password">生成的密码</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="password"
                value={password}
                readOnly
                className="font-mono text-sm"
              />
              <div className="flex gap-2 sm:w-40">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={generatePassword}
                >
                  重新生成
                </Button>
                <Button
                  type="button"
                  className="flex-1 border border-zinc-200 bg-transparent text-white hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
                  onClick={handleCopy}
                  disabled={!password}
                >
                  {copied ? "已复制" : "复制"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>密码强度</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {strengthLabel}
                </span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className={`h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 ${
                      strengthBar && i < strengthBar.segments
                        ? strengthBar.color
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-dashed border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="length">密码长度</Label>
                <p className="text-xs text-zinc-500">
                  建议至少 12 位，重要账号使用 16 位以上。
          </p>
        </div>
              <div className="flex items-center gap-2">
                <Input
                  id="length"
                  type="number"
                  min={4}
                  max={128}
                  value={length}
                  onChange={(e) => handleLengthInput(e.target.value)}
                  className="w-20 text-right"
                />
                <span className="text-xs text-zinc-500">字符</span>
              </div>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-medium text-zinc-500">
                字符类型（至少选一项）
              </p>
              <div className="space-y-2 text-sm">
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                  <span>小写字母 (a-z)</span>
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-zinc-900"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                  <span>大写字母 (A-Z)</span>
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-zinc-900"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                  <span>数字 (0-9)</span>
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-zinc-900"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                  <span>符号 (!@#...)</span>
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-zinc-900"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-zinc-500">高级选项</p>
              <div className="space-y-2 text-sm">
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                  <span>排除易混淆字符 (0/O/1/l)</span>
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-zinc-900"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40">
                  <span>排除容易误输符号</span>
                  <input
                    type="checkbox"
                    checked={excludeAmbiguous}
                    onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-zinc-900"
                  />
                </label>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                生成后建议使用密码管理器保存，不要在多个网站重复使用同一组密码。
              </p>
            </div>
        </div>
        </CardContent>
      </Card>
      <Toast
        message="密码已复制到剪贴板"
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

