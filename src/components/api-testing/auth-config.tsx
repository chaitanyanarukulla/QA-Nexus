'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface AuthConfigProps {
  authType: string;
  authConfig?: any;
  onAuthTypeChange: (type: string) => void;
  onAuthConfigChange: (config: any) => void;
}

export function AuthConfig({
  authType,
  authConfig = {},
  onAuthTypeChange,
  onAuthConfigChange
}: AuthConfigProps) {
  const [showPassword, setShowPassword] = useState(false)

  const handleBearerChange = (token: string) => {
    onAuthConfigChange({ token })
  }

  const handleBasicChange = (username: string, password: string) => {
    onAuthConfigChange({ username, password })
  }

  const handleApiKeyChange = (key: string, value: string, location: string) => {
    onAuthConfigChange({ key, value, location })
  }

  const handleOAuth2Change = (clientId: string, clientSecret: string, tokenUrl: string) => {
    onAuthConfigChange({ clientId, clientSecret, tokenUrl })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="auth-type">Authentication Type</Label>
        <Select value={authType} onValueChange={onAuthTypeChange}>
          <SelectTrigger id="auth-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">None</SelectItem>
            <SelectItem value="BEARER_TOKEN">Bearer Token</SelectItem>
            <SelectItem value="BASIC_AUTH">Basic Auth</SelectItem>
            <SelectItem value="API_KEY">API Key</SelectItem>
            <SelectItem value="OAUTH2">OAuth 2.0</SelectItem>
            <SelectItem value="AWS_SIGNATURE">AWS Signature</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bearer Token */}
      {authType === 'BEARER_TOKEN' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bearer Token</CardTitle>
            <CardDescription>Add a Bearer token for authorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bearer-token">Token</Label>
              <Input
                id="bearer-token"
                type="password"
                placeholder="Enter your bearer token"
                value={authConfig.token || ''}
                onChange={(e) => handleBearerChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be added to the Authorization header as: Bearer {'{token}'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Auth */}
      {authType === 'BASIC_AUTH' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Authentication</CardTitle>
            <CardDescription>Enter username and password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="basic-username">Username</Label>
              <Input
                id="basic-username"
                placeholder="Enter username"
                value={authConfig.username || ''}
                onChange={(e) => handleBasicChange(e.target.value, authConfig.password || '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic-password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="basic-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={authConfig.password || ''}
                  onChange={(e) => handleBasicChange(authConfig.username || '', e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Credentials will be Base64 encoded and added to Authorization header
            </p>
          </CardContent>
        </Card>
      )}

      {/* API Key */}
      {authType === 'API_KEY' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Key</CardTitle>
            <CardDescription>Add an API key to your request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="api-key-name">Key Name</Label>
              <Input
                id="api-key-name"
                placeholder="e.g., X-API-Key or api_key"
                value={authConfig.key || ''}
                onChange={(e) => handleApiKeyChange(e.target.value, authConfig.value || '', authConfig.location || 'header')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key-value">Key Value</Label>
              <Input
                id="api-key-value"
                type="password"
                placeholder="Enter your API key"
                value={authConfig.value || ''}
                onChange={(e) => handleApiKeyChange(authConfig.key || '', e.target.value, authConfig.location || 'header')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key-location">Add to</Label>
              <Select
                value={authConfig.location || 'header'}
                onValueChange={(location) =>
                  handleApiKeyChange(authConfig.key || '', authConfig.value || '', location)
                }
              >
                <SelectTrigger id="api-key-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="query">Query Parameter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OAuth 2.0 */}
      {authType === 'OAUTH2' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">OAuth 2.0</CardTitle>
            <CardDescription>Configure OAuth 2.0 client credentials flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="oauth-client-id">Client ID</Label>
              <Input
                id="oauth-client-id"
                placeholder="Enter Client ID"
                value={authConfig.clientId || ''}
                onChange={(e) =>
                  handleOAuth2Change(e.target.value, authConfig.clientSecret || '', authConfig.tokenUrl || '')
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oauth-client-secret">Client Secret</Label>
              <Input
                id="oauth-client-secret"
                type="password"
                placeholder="Enter Client Secret"
                value={authConfig.clientSecret || ''}
                onChange={(e) =>
                  handleOAuth2Change(authConfig.clientId || '', e.target.value, authConfig.tokenUrl || '')
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oauth-token-url">Token URL</Label>
              <Input
                id="oauth-token-url"
                placeholder="https://oauth.example.com/token"
                value={authConfig.tokenUrl || ''}
                onChange={(e) =>
                  handleOAuth2Change(authConfig.clientId || '', authConfig.clientSecret || '', e.target.value)
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Token will be automatically obtained and added to Authorization header
            </p>
          </CardContent>
        </Card>
      )}

      {/* AWS Signature */}
      {authType === 'AWS_SIGNATURE' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AWS Signature</CardTitle>
            <CardDescription>Sign requests with AWS credentials (Phase 3+)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AWS Signature authentication support coming in a future update.
            </p>
          </CardContent>
        </Card>
      )}

      {/* None */}
      {authType === 'NONE' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No Authentication</CardTitle>
            <CardDescription>This request will not include authentication credentials</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
