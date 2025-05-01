import Link from "next/link"
import { Cat, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SubmitPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <div className="container mx-auto max-w-5xl flex items-center justify-between w-full">
          <Link className="flex items-center justify-center" href="/">
            <Cat className="h-6 w-6 text-primary" />
            <span className="ml-2 text-xl font-bold">MeowMoew Pad</span>
          </Link>
          <div className="flex items-center">
            <nav className="flex gap-4 sm:gap-6 mr-4">
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                Launches
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                Projects
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                Learn
              </Link>
            </nav>
            <Button>Connect Wallet</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Submit Your Meme Coin</h1>
            <p className="mt-2 text-muted-foreground">
              Fill out the form below to submit your meme coin for listing on MeowMoew Pad.
            </p>
          </div>

          <form className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide the basic details about your meme coin project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Coin Name</Label>
                    <Input id="name" placeholder="e.g. MeowZircuit" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol</Label>
                    <Input id="symbol" placeholder="e.g. MEOW" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your meme coin (max 150 characters)"
                    className="resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo Upload</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Cat className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Input id="logo" type="file" accept="image/*" className="flex-1" required />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a square image (recommended: 512x512px, max 2MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tokenomics</CardTitle>
                <CardDescription>Provide details about your token's economics and distribution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="total-supply">Total Supply</Label>
                    <Input id="total-supply" placeholder="e.g. 1,000,000,000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initial-price">Initial Token Price (USD)</Label>
                    <Input id="initial-price" placeholder="e.g. 0.000042" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sale-allocation">Public Sale Allocation (%)</Label>
                    <Input id="sale-allocation" placeholder="e.g. 40" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liquidity-allocation">Liquidity Allocation (%)</Label>
                    <Input id="liquidity-allocation" placeholder="e.g. 20" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenomics">Additional Tokenomics</Label>
                  <Textarea
                    id="tokenomics"
                    placeholder="Describe any additional tokenomics features (e.g., reflection, burn mechanism, etc.)"
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Tell us more about your project and its goals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whitepaper">Whitepaper URL</Label>
                    <Input id="whitepaper" placeholder="https://" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input id="twitter" placeholder="https://twitter.com/" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input id="telegram" placeholder="https://t.me/" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="animal">Animal Meme</SelectItem>
                      <SelectItem value="character">Character Meme</SelectItem>
                      <SelectItem value="food">Food Meme</SelectItem>
                      <SelectItem value="internet">Internet Culture</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="long-description">Project Description</Label>
                  <Textarea
                    id="long-description"
                    placeholder="Provide a detailed description of your project, its goals, and why it's unique"
                    className="min-h-[120px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Launch Details</CardTitle>
                <CardDescription>Specify your desired launch parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="funding-goal">Funding Goal (USD)</Label>
                    <Input id="funding-goal" placeholder="e.g. 50000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Launch Duration (Days)</Label>
                    <Select>
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="21">21 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Separator />
                <div className="text-sm text-muted-foreground">
                  By submitting this form, you agree to our{" "}
                  <Link href="#" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="underline underline-offset-4 hover:text-primary">
                    Launch Guidelines
                  </Link>
                  .
                </div>
                <Button type="submit" className="w-full">
                  Submit Meme Coin
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2023 MeowMoew Pad. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
