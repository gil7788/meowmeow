"use client";

import { useState } from "react";
import { AboutTab } from "@/components/meme/AboutTab";
import { BuySellTab } from "@/components/meme/BuySellTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownUp, Info } from "lucide-react";
import { ProjectData } from "~~/lib/types";

export default function MemeTabs({ meme }: { meme: ProjectData }) {
  const [isBuying, setIsBuying] = useState(true);
  const [amount, setAmount] = useState("");

  const toggleTradeDirection = () => {
    setIsBuying(prev => !prev);
    setAmount("");
  };

  return (
    <Tabs defaultValue="buy-sell">
      <TabsList className="mb-4">
        <TabsTrigger value="buy-sell" className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4" />
          <span>Buy/Sell</span>
        </TabsTrigger>
        <TabsTrigger value="about" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>About</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="buy-sell" className="space-y-6">
        <BuySellTab
          isBuying={isBuying}
          toggleTradeDirection={toggleTradeDirection}
          amount={amount}
          setAmount={setAmount}
          tokenSymbol={meme.tokenSymbol}
          tokenAddress={meme.id}
        />
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <AboutTab project={meme} />
      </TabsContent>
    </Tabs>
  );
}
