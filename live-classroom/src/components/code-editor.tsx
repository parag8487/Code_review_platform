"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Code, Users, Loader2, Edit } from "lucide-react";
import { Card } from "./ui/card";
import { LanguageSelector } from "./language-selector";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  isOwner: boolean;
  isCollab: boolean;
  toggleCollab: () => void;
  code: string;
  onCodeChange: (value: string | undefined) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  hasPermission: boolean;
  onPermissionRequest: () => void;
  isRequestPending: boolean;
}

export function CodeEditor({
  isOwner,
  isCollab,
  toggleCollab,
  code,
  onCodeChange,
  language,
  onLanguageChange,
  hasPermission,
  onPermissionRequest,
  isRequestPending,
}: CodeEditorProps) {
  
  const commonEditorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    automaticLayout: true,
  };

  return (
    <div className="flex flex-1 flex-col p-4 gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-accent" />
            <h2 className="font-semibold">Code Editor</h2>
          </div>
          <LanguageSelector language={language} setLanguage={onLanguageChange} isOwner={isOwner} />
        </div>
        {isOwner && (
          <div className="flex items-center space-x-2">
            <Switch
              id="collab-mode"
              checked={isCollab}
              onCheckedChange={toggleCollab}
            />
            <Label htmlFor="collab-mode">Collaborative Editing</Label>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
        {isCollab ? (
          <>
            <Card className="flex flex-col p-2 overflow-hidden">
                <div className="text-xs text-muted-foreground px-2 pb-2 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Owner's Editor
                </div>
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    theme="vs-dark"
                    onChange={isOwner ? onCodeChange : undefined}
                    options={{...commonEditorOptions, readOnly: !isOwner}}
                />
            </Card>
            <Card className="flex flex-col p-2 overflow-hidden">
                 <div className="text-xs text-muted-foreground px-2 pb-2 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    User's Editor
                </div>
                {hasPermission || isOwner ? (
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={onCodeChange}
                        options={{...commonEditorOptions, readOnly: !hasPermission && !isOwner}}
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-card p-4">
                        <p className="text-center text-muted-foreground mb-4">You need the owner's permission to write in this editor.</p>
                        <Button onClick={onPermissionRequest} disabled={isRequestPending}>
                            {isRequestPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Edit className="mr-2 h-4 w-4" />}
                            {isRequestPending ? "Requesting..." : "Request Permission to Edit"}
                        </Button>
                    </div>
                )}
            </Card>
          </>
        ) : (
          <Card className="md:col-span-2 flex flex-col p-2 overflow-hidden">
            <div className="text-xs text-muted-foreground px-2 pb-2 flex items-center gap-2">
                    <Code className="h-3 w-3" />
                    Main Editor
            </div>
             <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={onCodeChange}
                options={{...commonEditorOptions, readOnly: !isOwner && !isCollab}}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
