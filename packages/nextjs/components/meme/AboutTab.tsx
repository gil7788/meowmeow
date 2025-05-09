"use client";

import React from "react";
import { TokenAllocation } from "@/components/token-allocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectData } from "~~/lib/types";

export function AboutTab({ project }: { project: ProjectData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Project Overview</h3>
        <p className="text-muted-foreground">{project.longDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Token Symbol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.tokenSymbol}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Token Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.tokenPrice}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.totalSupply}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Token Allocation</h3>
        <TokenAllocation data={project.tokenAllocation} />
      </div>
    </div>
  );
}
