'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PreRequestEditorProps {
  script: string;
  onScriptChange: (script: string) => void;
}

export function PreRequestEditor({ script, onScriptChange }: PreRequestEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pre-request">Pre-Request Script</Label>
        <p className="text-xs text-muted-foreground mt-1">
          JavaScript code that runs before the request is sent. Use this for setup logic, dynamic values, etc.
        </p>
      </div>

      <Textarea
        id="pre-request"
        placeholder={`// Example: Set current timestamp
const timestamp = new Date().toISOString();
console.log('Request timestamp:', timestamp);

// Example: Generate random ID
const randomId = Math.random().toString(36).substr(2, 9);
console.log('Generated ID:', randomId);

// Example: Calculate signature
const crypto = require('crypto');
const signature = crypto.createHash('sha256').update('data').digest('hex');
console.log('Signature:', signature);
`}
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        className="font-mono text-sm min-h-[300px] resize-none"
      />

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Available Functions</CardTitle>
          <CardDescription>Use these functions in your pre-request script</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="font-mono text-xs">console.log()</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Print output to logs for debugging</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="font-mono text-xs">Date.now()</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Get current timestamp in milliseconds</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="font-mono text-xs">Math.random()</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Generate random numbers</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="font-mono text-xs">JSON.stringify() / parse()</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Serialize and deserialize JSON</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Common Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Generate UUID:</p>
            <code className="block bg-muted p-2 rounded text-xs font-mono mb-2">
              {`const uuid = crypto.randomUUID();\nvar headers = {'X-Request-ID': uuid};`}
            </code>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Set Authorization Header:</p>
            <code className="block bg-muted p-2 rounded text-xs font-mono mb-2">
              {`const token = 'your-token-here';\nvar headers = {'Authorization': 'Bearer ' + token};`}
            </code>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Calculate Timestamp:</p>
            <code className="block bg-muted p-2 rounded text-xs font-mono">
              {`const timestamp = Math.floor(Date.now() / 1000);\nvar queryParams = {'timestamp': timestamp};`}
            </code>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
        ℹ️ Pre-request scripts run in a limited Node.js environment. Not all npm packages are available.
        For complex logic, consider moving setup to environment variables or using the test scripts instead.
      </div>
    </div>
  )
}
