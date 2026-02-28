"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/client";
import {
  GitBranch,
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Loader2,
  Search,
  Github,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface FileTreeItem {
  path: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
}

interface FileTreeProps {
  items: FileTreeItem[];
  onFileSelect?: (path: string, name: string) => void;
  selectedPath?: string;
  onFolderExpand?: (path: string) => void;
  expandedFolders: Set<string>;
  isLoading?: boolean;
}

function FileTreeItemComponent({
  item,
  onFileSelect,
  selectedPath,
  onFolderExpand,
  expandedFolders,
  isLoading,
  depth = 0,
}: {
  item: FileTreeItem;
  onFileSelect?: (path: string, name: string) => void;
  selectedPath?: string;
  onFolderExpand?: (path: string) => void;
  expandedFolders: Set<string>;
  isLoading?: boolean;
  depth?: number;
}) {
  const isExpanded = expandedFolders.has(item.path);
  const isSelected = selectedPath === item.path;
  const isFolder = item.type === "folder";

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            onFolderExpand?.(item.path);
          } else {
            onFileSelect?.(item.path, item.name);
          }
        }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
          isSelected
            ? "bg-[#156d95]/10 text-[#156d95] dark:text-[#4fc3f7]"
            : "hover:bg-secondary text-foreground dark:text-[#d4d4d4] dark:hover:bg-[#3c3c3c]",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0 text-amber-500" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0 text-amber-500" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          </>
        )}
        <span className="truncate">{item.name}</span>
      </button>
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItemComponent
              key={child.path}
              item={child}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              onFolderExpand={onFolderExpand}
              expandedFolders={expandedFolders}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  items,
  onFileSelect,
  selectedPath,
  onFolderExpand,
  expandedFolders,
  isLoading,
}: FileTreeProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-2">
      {items.map((item) => (
        <FileTreeItemComponent
          key={item.path}
          item={item}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          onFolderExpand={onFolderExpand}
          expandedFolders={expandedFolders}
        />
      ))}
    </div>
  );
}

interface GitHubImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepoSelect: (repoUrl: string, repoName: string) => void;
}

export function GitHubImportDialog({
  open,
  onOpenChange,
  onRepoSelect,
}: GitHubImportDialogProps) {
  const [repos, setRepos] = useState<
    {
      id: number;
      name: string;
      fullName: string;
      description: string | null;
      private: boolean;
      htmlUrl: string;
      language: string | null;
    }[]
  >([]);
  const [selectedRepo, setSelectedRepo] = useState<{
    fullName: string;
    htmlUrl: string;
  } | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set([""]),
  );
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState<"connect" | "repos" | "tree">("connect");
  const [isGitHubConnected, setIsGitHubConnected] = useState<boolean | null>(
    null,
  );
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  useEffect(() => {
    if (open) {
      setIsCheckingConnection(true);
      setError(null);
      checkGitHubConnection();
    }
  }, [open]);

  const checkGitHubConnection = async () => {
    try {
      const result = await fetch("/api/trpc/github.isConnected", {
        headers: { "Content-Type": "application/json" },
      });
      const json = await result.json();
      const connected = json.result?.data?.json ?? false;
      setIsGitHubConnected(connected);
      if (connected) {
        setStep("repos");
        fetchRepos();
      } else {
        setStep("connect");
      }
    } catch {
      setIsGitHubConnected(false);
      setStep("connect");
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleSignInWithGitHub = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
      });
    } catch (err) {
      setError("Failed to sign in with GitHub");
    }
  };

  const fetchRepos = async () => {
    setIsLoadingRepos(true);
    setError(null);
    try {
      const result = await fetch("/api/trpc/github.getRepositories", {
        headers: { "Content-Type": "application/json" },
      });
      const json = await result.json();
      if (json.error) {
        setError(json.error.message || "Failed to fetch repositories");
        return;
      }
      const repos = json.result?.data?.json ?? [];
      setRepos(repos);
    } catch (err) {
      setError("Failed to fetch repositories");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const fetchFileTree = async (repoUrl: string, path: string = "") => {
    setIsLoadingTree(true);
    try {
      const encodedPath = encodeURIComponent(path);
      const result = await fetch(
        `/api/trpc/github.getRepoContents?input=${encodeURIComponent(JSON.stringify({ repoUrl, path }))}`,
        { headers: { "Content-Type": "application/json" } },
      );
      const json = await result.json();
      if (json.error) {
        setError(json.error.message || "Failed to fetch contents");
        return;
      }
      const contents = json.result?.data?.json ?? [];

      const items: FileTreeItem[] = contents.map(
        (item: { path: string; name: string; type: string }) => ({
          path: item.path,
          name: item.name,
          type: item.type === "dir" ? "folder" : "file",
          children: item.type === "dir" ? [] : undefined,
        }),
      );

      if (path === "") {
        setFileTree(items);
      } else {
        setFileTree((prev) => updateTreeWithContents(prev, path, items));
      }
    } catch (err) {
      setError("Failed to fetch contents");
    } finally {
      setIsLoadingTree(false);
    }
  };

  const updateTreeWithContents = (
    tree: FileTreeItem[],
    parentPath: string,
    contents: FileTreeItem[],
  ): FileTreeItem[] => {
    return tree.map((item) => {
      if (item.path === parentPath) {
        return { ...item, children: contents };
      }
      if (item.children) {
        return {
          ...item,
          children: updateTreeWithContents(item.children, parentPath, contents),
        };
      }
      return item;
    });
  };

  const handleFolderExpand = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
        if (selectedRepo) {
          fetchFileTree(selectedRepo.htmlUrl, path);
        }
      }
      return next;
    });
  };

  const handleFileSelect = (path: string, name: string) => {
    setSelectedPath(path);
  };

  const handleImport = () => {
    if (selectedRepo && selectedPath) {
      onRepoSelect(selectedRepo.htmlUrl, selectedPath);
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    setStep("connect");
    setSelectedRepo(null);
    setFileTree([]);
    setSelectedPath(undefined);
    setSearchQuery("");
    setError(null);
    setIsGitHubConnected(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetState();
    }
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRepoSelect = (repo: { fullName: string; htmlUrl: string }) => {
    setSelectedRepo(repo);
    setStep("tree");
    setExpandedFolders(new Set([""]));
    fetchFileTree(repo.htmlUrl, "");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            {step === "connect"
              ? "Connect your GitHub account to import repositories"
              : step === "repos"
                ? "Select a repository to import"
                : `Browsing: ${selectedRepo?.fullName}`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {step === "connect" ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {isCheckingConnection ? (
              <>
                <Loader2 className="text-muted-foreground mb-4 h-12 w-12 animate-spin" />
                <p className="text-muted-foreground">Checking connection...</p>
              </>
            ) : (
              <>
                <div className="bg-secondary mb-6 rounded-full p-4 dark:bg-[#3c3c3c]">
                  <Github className="text-foreground h-12 w-12 dark:text-[#d4d4d4]" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold dark:text-[#d4d4d4]">
                  Connect to GitHub
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                  Sign in with GitHub to browse your repositories and import
                  code directly into your room.
                </p>
                <Button
                  onClick={handleSignInWithGitHub}
                  className="bg-[#24292e] text-white hover:bg-[#2f363d]"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Continue with GitHub
                </Button>
              </>
            )}
          </div>
        ) : step === "repos" ? (
          <>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[400px] min-h-[300px] flex-1 overflow-y-auto">
              {isLoadingRepos ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : repos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Github className="text-muted-foreground mb-4 h-12 w-12" />
                  <p className="text-muted-foreground mb-4 text-sm">
                    No repositories found. Make sure you have connected your
                    GitHub account.
                  </p>
                  <Button onClick={fetchRepos} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo)}
                      className="hover:bg-secondary flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors dark:hover:bg-[#3c3c3c]"
                    >
                      <GitBranch className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate font-medium dark:text-[#d4d4d4]">
                          {repo.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {repo.description || repo.fullName}
                        </p>
                      </div>
                      {repo.private && (
                        <span className="bg-secondary rounded px-2 py-0.5 text-xs dark:bg-[#3c3c3c]">
                          Private
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={fetchRepos}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  if (repos.length === 0) {
                    fetchRepos();
                  }
                }}
                disabled={repos.length === 0 && !isLoadingRepos}
              >
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("repos")}
              >
                ← Back
              </Button>
              <span className="text-muted-foreground text-sm">
                Select a file to import
              </span>
            </div>

            <div className="max-h-[400px] min-h-[300px] flex-1 overflow-y-auto rounded-md border">
              <FileTree
                items={fileTree}
                onFileSelect={handleFileSelect}
                onFolderExpand={handleFolderExpand}
                expandedFolders={expandedFolders}
                selectedPath={selectedPath}
                isLoading={isLoadingTree}
              />
            </div>

            {selectedPath && (
              <div className="bg-secondary mt-4 rounded-md p-3 dark:bg-[#3c3c3c]">
                <p className="text-sm">
                  <span className="text-muted-foreground">Selected: </span>
                  <span className="text-foreground font-mono dark:text-[#d4d4d4]">
                    {selectedPath}
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setStep("repos")}>
                Change Repository
              </Button>
              <Button onClick={handleImport} disabled={!selectedPath}>
                Import File
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
