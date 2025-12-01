'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getJiraEpics, searchConfluencePages, generateTestPlanFromEpic, generateTestCasesFromPage } from '@/app/actions/import'
import { analyzeJiraEpic, analyzeConfluencePage } from '@/app/actions/document-analysis'
import { toast } from 'sonner'
import { Loader2, Search, FileText, Layers } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export function ImportDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const router = useRouter()

    // Jira State
    const [projectKey, setProjectKey] = useState('')
    const [epics, setEpics] = useState<any[]>([])
    const [selectedEpic, setSelectedEpic] = useState<string | null>(null)

    // Confluence State
    const [searchQuery, setSearchQuery] = useState('')
    const [pages, setPages] = useState<any[]>([])
    const [selectedPage, setSelectedPage] = useState<string | null>(null)

    async function handleSearchEpics() {
        if (!projectKey) return
        setLoading(true)
        const res = await getJiraEpics('demo-user', projectKey)
        if (res.success && res.epics) {
            setEpics(res.epics)
        }
        setLoading(false)
    }

    async function handleSearchPages() {
        // Allow empty query to fetch recent pages
        setLoading(true)
        const res = await searchConfluencePages('demo-user', searchQuery)
        if (res.success && res.pages) {
            setPages(res.pages)
        }
        setLoading(false)
    }

    async function handleImportEpic() {
        if (!selectedEpic) return
        setGenerating(true)
        const res = await generateTestPlanFromEpic('demo-user', selectedEpic)
        setGenerating(false)
        if (res.success) {
            toast.success('Test plan generated successfully!')
            setOpen(false)
            router.refresh()
        } else {
            toast.error(res.error || 'Failed to generate test plan')
        }
    }

    async function handleImportPage() {
        if (!selectedPage) return
        setGenerating(true)
        const res = await generateTestCasesFromPage('demo-user', selectedPage)
        setGenerating(false)
        if (res.success) {
            toast.success('Test cases generated successfully!')
            setOpen(false)
            router.refresh()
        } else {
            toast.error(res.error || 'Failed to generate test cases')
        }
    }

    async function handleAnalyzeEpic() {
        if (!selectedEpic) return
        setGenerating(true)
        const res = await analyzeJiraEpic('demo-user', selectedEpic)
        setGenerating(false)
        if (res.success) {
            toast.success('Document analyzed successfully!')
            setOpen(false)
            router.push(`/document-analysis/${res.analysisId}`)
        } else {
            toast.error(res.error || 'Failed to analyze document')
        }
    }

    async function handleAnalyzePage() {
        if (!selectedPage) return
        setGenerating(true)
        const res = await analyzeConfluencePage('demo-user', selectedPage)
        setGenerating(false)
        if (res.success) {
            toast.success('Document analyzed successfully!')
            setOpen(false)
            router.push(`/document-analysis/${res.analysisId}`)
        } else {
            toast.error(res.error || 'Failed to analyze document')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <div className="flex flex-row items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>Import Content</span>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import & Analyze Content</DialogTitle>
                    <DialogDescription>
                        Analyze documents for risks and gaps, then generate comprehensive test plans from Jira Epics or Confluence pages.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="jira" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="jira">Jira Epic</TabsTrigger>
                        <TabsTrigger value="confluence">Confluence Page</TabsTrigger>
                    </TabsList>



                    <TabsContent value="jira" className="space-y-4 pt-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Project Key (e.g. PROJ)"
                                value={projectKey}
                                onChange={(e) => setProjectKey(e.target.value)}
                            />
                            <Button onClick={handleSearchEpics} disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch Epics'}
                            </Button>
                        </div>

                        {epics.length > 0 ? (
                            <Select onValueChange={setSelectedEpic}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an Epic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {epics.map(epic => (
                                        <SelectItem key={epic.id} value={epic.key}>
                                            <span className="font-medium mr-2">{epic.key}:</span>
                                            {epic.fields.summary}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                                Enter a project key to fetch Epics
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button className="flex-1" variant="outline" onClick={handleAnalyzeEpic} disabled={!selectedEpic || generating}>
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze Document'
                                )}
                            </Button>
                            <Button className="flex-1" onClick={handleImportEpic} disabled={!selectedEpic || generating}>
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Test Plan'
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="confluence" className="space-y-4 pt-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search docs (leave empty for recent)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button onClick={handleSearchPages} disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch Docs'}
                            </Button>
                        </div>

                        {pages.length > 0 ? (
                            <Select onValueChange={setSelectedPage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Design Doc / BRD" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pages.map(page => (
                                        <SelectItem key={page.id} value={page.id}>
                                            {page.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                                Search for Design Docs or BRDs
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button className="flex-1" variant="outline" onClick={handleAnalyzePage} disabled={!selectedPage || generating}>
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze Document'
                                )}
                            </Button>
                            <Button className="flex-1" onClick={handleImportPage} disabled={!selectedPage || generating}>
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Test Cases'
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
