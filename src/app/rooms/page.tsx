"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Plus,
  Users,
  Code2,
  Sparkles,
  Bug,
  FileCode,
  Folder,
  Send,
  Copy,
  Settings,
  Search,
  MoreHorizontal,
  Play,
  Terminal,
  Maximize2,
  Minimize2,
  MessageSquare,
  Circle,
  Sun,
  Moon,
  Share,
  Github,
  GitBranch,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { GitHubImportDialog } from "../_components/github-import-dialog";

type Workspace = {
  id: string;
  name: string;
  type: "personal" | "team";
  members: number;
  lastActive: string;
  status: "active" | "idle" | "offline";
};

type Room = {
  id: string;
  name: string;
  language: string;
  participants: number;
  isActive: boolean;
};

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "message" | "bug-fix" | "code-suggestion";
};

type TeamMessage = {
  id: string;
  role: "user";
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: Date;
};

type Participant = {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
};

const workspaces: Workspace[] = [
  {
    id: "1",
    name: "My Projects",
    type: "personal",
    members: 1,
    lastActive: "2 min ago",
    status: "active",
  },
  {
    id: "2",
    name: "Team Alpha",
    type: "team",
    members: 5,
    lastActive: "5 min ago",
    status: "active",
  },
  {
    id: "3",
    name: "Hackathon 2026",
    type: "team",
    members: 8,
    lastActive: "1 hour ago",
    status: "idle",
  },
  {
    id: "4",
    name: "Open Source",
    type: "personal",
    members: 1,
    lastActive: "2 days ago",
    status: "offline",
  },
];

const rooms: Room[] = [
  {
    id: "1",
    name: "auth-module",
    language: "TypeScript",
    participants: 3,
    isActive: true,
  },
  {
    id: "2",
    name: "api-endpoints",
    language: "Python",
    participants: 2,
    isActive: true,
  },
  {
    id: "3",
    name: "ui-components",
    language: "React",
    participants: 4,
    isActive: false,
  },
];

const aiMessages: AIMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your AI coding assistant. Describe the bug you're facing or paste an error message, and I'll help you fix it.",
    timestamp: new Date(),
    type: "message",
  },
  {
    id: "2",
    role: "user",
    content:
      "I'm getting a TypeError: Cannot read property 'map' of undefined when trying to render a list of users",
    timestamp: new Date(),
    type: "message",
  },
  {
    id: "3",
    role: "assistant",
    content:
      "I can help you fix this! The error occurs because you're trying to call .map() on an undefined value. Here's the fix:\n\n```typescript\n// Before (causing error)\nconst users = data.users;\nusers.map(user => <UserCard user={user} />);\n\n// After (fixed)\nconst users = data?.users ?? [];\nusers.map(user => <UserCard user={user} />);\n\n// Or with optional chaining\ndata?.users?.map(user => <UserCard user={user} />)\n```\n\nThis ensures users is always an array, even if data.users is undefined.",
    timestamp: new Date(),
    type: "bug-fix",
  },
];

const teamMessages: TeamMessage[] = [
  {
    id: "1",
    role: "user",
    userId: "akash",
    userName: "Akash",
    userColor: "#9333ea",
    content:
      "Hey team, I'm working on the JWT validation. Can someone review my PR?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    role: "user",
    userId: "chiranjeet",
    userName: "Chiranjeet",
    userColor: "#ea580c",
    content: "On it! Will take a look in 5 mins",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    role: "user",
    userId: "akash",
    userName: "Akash",
    userColor: "#9333ea",
    content:
      "Thanks! I also found a potential security issue with the token expiry",
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: "4",
    role: "user",
    userId: "vedant",
    userName: "Vedant",
    userColor: "#0891b2",
    content: "Good catch. We should also add refresh token rotation",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "5",
    role: "user",
    userId: "chiranjeet",
    userName: "Chiranjeet",
    userColor: "#ea580c",
    content:
      "PR looks good overall. Just a few nits - the error messages could be more descriptive",
    timestamp: new Date(Date.now() - 60000),
  },
];

const participants: Participant[] = [
  { id: "akash", name: "Akash (You)", status: "online" },
  { id: "chiranjeet", name: "Chiranjeet", status: "online" },
  { id: "vedant", name: "Vedant", status: "away" },
  { id: "varun", name: "Varun", status: "online" },
  { id: "luv", name: "Luv", status: "offline" },
];

const codeLines = [
  { line: 1, content: "// auth-module/index.ts" },
  {
    line: 2,
    content: "import { Request, Response, NextFunction } from 'express';",
  },
  { line: 3, content: "import jwt from 'jsonwebtoken';" },
  { line: 4, content: "" },
  { line: 5, content: "interface AuthRequest extends Request {" },
  { line: 6, content: "  user?: {" },
  { line: 7, content: "    id: string;" },
  { line: 8, content: "    email: string;" },
  { line: 9, content: "    role: string;" },
  { line: 10, content: "  };" },
  { line: 11, content: "}" },
  { line: 12, content: "" },
  { line: 13, content: "export const authenticate = async (" },
  { line: 14, content: "  req: AuthRequest," },
  { line: 15, content: "  res: Response," },
  { line: 16, content: "  next: NextFunction" },
  { line: 17, content: ") => {" },
  { line: 18, content: "  try {" },
  {
    line: 19,
    content: "    const token = req.headers.authorization?.split(' ')[1];",
  },
  { line: 20, content: "" },
  { line: 21, content: "    if (!token) {" },
  { line: 22, content: "      return res.status(401).json({ " },
  { line: 23, content: "        error: 'No token provided'" },
  { line: 24, content: "      });" },
  { line: 25, content: "    }" },
  { line: 26, content: "" },
  {
    line: 27,
    content: "    const decoded = jwt.verify(token, process.env.JWT_SECRET!);",
  },
  { line: 28, content: "    req.user = decoded as AuthRequest['user'];" },
  { line: 29, content: "" },
  { line: 30, content: "    next();" },
  { line: 31, content: "  } catch (error) {" },
  { line: 32, content: "    return res.status(401).json({ " },
  { line: 33, content: "      error: 'Invalid token'" },
  { line: 34, content: "    });" },
  { line: 35, content: "  }" },
  { line: 36, content: "};" },
];

const tokenize = (line: string) => {
  const tokens: { text: string; type: string }[] = [];

  const keywords = [
    "import",
    "export",
    "const",
    "let",
    "var",
    "return",
    "if",
    "else",
    "try",
    "catch",
    "async",
    "await",
    "interface",
    "from",
    "as",
  ];
  const types = [
    "Request",
    "Response",
    "NextFunction",
    "string",
    "number",
    "boolean",
  ];

  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Strings
    const stringMatch = remaining.match(/^(['"`].*?['"`])/);
    if (stringMatch) {
      tokens.push({ text: stringMatch[1], type: "string" });
      remaining = remaining.slice(stringMatch[1].length);
      continue;
    }

    // Comments
    const commentMatch = remaining.match(/^(\/\/.*)/);
    if (commentMatch) {
      tokens.push({ text: commentMatch[1], type: "comment" });
      remaining = remaining.slice(commentMatch[1].length);
      continue;
    }

    // Keywords and types
    const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywords.includes(word)) {
        tokens.push({ text: word, type: "keyword" });
      } else if (types.includes(word)) {
        tokens.push({ text: word, type: "type" });
      } else {
        tokens.push({ text: word, type: "text" });
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Numbers
    const numberMatch = remaining.match(/^\d+/);
    if (numberMatch) {
      tokens.push({ text: numberMatch[0], type: "number" });
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    // Punctuation
    tokens.push({ text: remaining[0], type: "punctuation" });
    remaining = remaining.slice(1);
  }

  return tokens;
};

export default function RoomsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(rooms[0]);
  const [roomsList, setRoomsList] = useState<Room[]>(rooms);
  const [aiInput, setAiInput] = useState("");
  const [teamChatInput, setTeamChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [activeChatTab, setActiveChatTab] = useState<"ai" | "team">("ai");
  const [isGitHubDialogOpen, setIsGitHubDialogOpen] = useState(false);
  const [importedRepo, setImportedRepo] = useState<{
    url: string;
    path: string;
    name: string;
    repoUrl: string;
  } | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const getFileContentMutation = api.github.getFileContent.useMutation();

  useEffect(() => {
    const fetchContent = async () => {
      if (importedRepo) {
        try {
          const content = await getFileContentMutation.mutateAsync({
            repoUrl: importedRepo.repoUrl,
            path: importedRepo.path,
          });
          setFileContent(content);
        } catch (err) {
          console.error("Failed to fetch file content:", err);
        }
      }
    };
    fetchContent();
  }, [importedRepo]);

  const displayCodeLines = useMemo(() => {
    if (fileContent) {
      return fileContent.split("\n").map((line, index) => ({
        line: index + 1,
        content: line,
      }));
    }
    return codeLines;
  }, [fileContent]);

  const handleRepoImport = (repoUrl: string, filePath: string) => {
    const repoName =
      filePath.split("/").pop() || filePath.split("/")[0] || "imported";
    const newRoom: Room = {
      id: `imported-${Date.now()}`,
      name: repoName,
      language: "TypeScript",
      participants: 1,
      isActive: true,
    };
    setImportedRepo({
      url: repoUrl,
      path: filePath,
      name: repoName,
      repoUrl: repoUrl,
    });
    setRoomsList((prev) => [newRoom, ...prev]);
    setSelectedRoom(newRoom);
    setIsGitHubDialogOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#1e1e1e]">
      {/* Left Sidebar - Workspaces & Rooms */}
      <div className="flex w-72 flex-shrink-0 flex-col border-r border-[#e5e5e5] bg-white dark:border-[#3c3c3c] dark:bg-[#252526]">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#e5e5e5] px-4 dark:border-[#3c3c3c]">
          <Link
            href="/"
            className="text-foreground hover:text-primary flex items-center gap-2 text-xl font-bold transition-colors"
            style={{ fontFamily: "Figtree, sans-serif" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            DevRoom
          </Link>
          <button className="hover:bg-secondary rounded-md p-1.5 transition-colors dark:hover:bg-[#3c3c3c]">
            <Settings className="text-muted-foreground h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rooms..."
              className="bg-secondary placeholder:text-muted-foreground text-foreground w-full rounded-md border-0 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-[#156d95]/30 focus:outline-none dark:bg-[#3c3c3c]"
            />
          </div>
        </div>

        {/* Workspaces Section */}
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Workspaces
            </span>
            <button className="hover:bg-secondary rounded p-1 transition-colors dark:hover:bg-[#3c3c3c]">
              <Plus className="text-muted-foreground h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                  selectedWorkspace.id === workspace.id
                    ? "bg-[#156d95]/10 text-[#156d95] dark:text-[#4fc3f7]"
                    : "hover:bg-secondary dark:hover:bg-[#3c3c3c]",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    selectedWorkspace.id === workspace.id
                      ? "bg-[#156d95] text-white"
                      : "bg-secondary dark:bg-[#3c3c3c]",
                  )}
                >
                  {workspace.type === "team" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium dark:text-[#d4d4d4]">
                    {workspace.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {workspace.members} member
                    {workspace.members !== 1 ? "s" : ""}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    workspace.status === "active"
                      ? "bg-green-500"
                      : workspace.status === "idle"
                        ? "bg-yellow-500"
                        : "bg-gray-300",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Section */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Rooms
            </span>
            <button className="hover:bg-secondary rounded p-1 transition-colors dark:hover:bg-[#3c3c3c]">
              <Plus className="text-muted-foreground h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {roomsList.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                  selectedRoom?.id === room.id
                    ? "bg-[#156d95]/10 text-[#156d95] dark:text-[#4fc3f7]"
                    : "hover:bg-secondary dark:hover:bg-[#3c3c3c]",
                )}
              >
                <Code2 className="h-4 w-4" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium dark:text-[#d4d4d4]">
                    {room.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {room.language} • {room.participants} online
                  </p>
                </div>
                {room.isActive && (
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                )}
              </button>
            ))}
          </div>

          {/* Create Room Button */}
          <button
            onClick={() => setIsGitHubDialogOpen(true)}
            className="text-muted-foreground mt-4 flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#e5e5e5] px-3 py-2.5 text-sm transition-colors hover:border-[#156d95] hover:text-[#156d95] dark:border-[#3c3c3c]"
          >
            <Github className="h-4 w-4" />
            Import from GitHub
          </button>

          <button className="text-muted-foreground mt-2 flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#e5e5e5] px-3 py-2.5 text-sm transition-colors hover:border-[#156d95] hover:text-[#156d95] dark:border-[#3c3c3c]">
            <Plus className="h-4 w-4" />
            Create New Room
          </button>
        </div>

        {/* User Profile */}
        <div className="border-t border-[#e5e5e5] p-3 dark:border-[#3c3c3c]">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#156d95] font-medium text-white">
              AP
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium dark:text-[#d4d4d4]">
                Akash Pandey
              </p>
              <p className="text-muted-foreground text-xs">Pro Plan</p>
            </div>
            <button className="hover:bg-secondary rounded-md p-1.5 transition-colors dark:hover:bg-[#3c3c3c]">
              <MoreHorizontal className="text-muted-foreground h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Code Editor */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Editor Header */}
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-5 dark:border-[#3c3c3c] dark:bg-[#252526]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#156d95]" />
              <span className="text-foreground text-sm font-medium dark:text-[#d4d4d4]">
                {selectedRoom?.name || "No room selected"}
              </span>
              {selectedRoom?.isActive && (
                <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                  Live
                </span>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>{selectedRoom?.participants || 0} participants</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hover:bg-secondary text-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors dark:text-[#d4d4d4] dark:hover:bg-[#3c3c3c]">
              <Play className="h-3.5 w-3.5" />
              Run
            </button>
            <button className="flex items-center gap-1.5 rounded-md bg-[#156d95] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#156d95]/90">
              <Share className="h-3.5 w-3.5" />
              Share
            </button>
            <div className="mx-1 h-6 w-px bg-[#e5e5e5]" />
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-secondary rounded-md p-2 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Code Editor Area - Scrollable */}
        <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e]">
          <div className="min-h-full">
            {/* Tab Bar */}
            <div className="flex items-center border-b border-[#e5e5e5] bg-[#f5f5f5] px-2 dark:border-[#3c3c3c] dark:bg-[#252526]">
              <div className="-mb-px flex items-center gap-1 rounded-t-md border-t border-t-2 border-[#156d95] bg-white px-3 py-2 dark:bg-[#1e1e1e]">
                <Code2 className="h-3.5 w-3.5 text-[#156d95]" />
                <span className="text-sm">index.ts</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-1 px-3 py-2">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Code Content */}
            <div className="flex">
              {/* Line Numbers */}
              <div className="text-muted-foreground w-12 flex-shrink-0 border-r border-[#e5e5e5] bg-[#fafafa] py-3 pr-3 text-right font-mono text-sm select-none dark:border-[#3c3c3c] dark:bg-[#1e1e1e]">
                {displayCodeLines.map((line) => (
                  <div key={line.line} className="leading-6">
                    {line.line}
                  </div>
                ))}
              </div>
              {/* Code */}
              <div className="flex-1 overflow-x-auto px-4 py-3">
                <pre className="font-mono text-sm">
                  {displayCodeLines.map((line) => (
                    <div key={line.line} className="leading-6">
                      {tokenize(line.content).map((token, i) => (
                        <span
                          key={i}
                          className={cn(
                            token.type === "keyword" &&
                              "text-[#0000ff] dark:text-[#569cd6]",
                            token.type === "string" &&
                              "text-[#098658] dark:text-[#ce9178]",
                            token.type === "comment" &&
                              "text-[#6a9955] dark:text-[#6a9955]",
                            token.type === "type" &&
                              "text-[#267f99] dark:text-[#4ec9b0]",
                            token.type === "number" &&
                              "text-[#098658] dark:text-[#b5cea8]",
                            token.type === "punctuation" &&
                              "text-[#000000] dark:text-[#d4d4d4]",
                            token.type === "text" &&
                              "text-[#000000] dark:text-[#d4d4d4]",
                          )}
                        >
                          {token.text}
                        </span>
                      ))}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Panel - Collapsible */}
        <div
          className={cn(
            "flex-shrink-0 border-t border-[#333] bg-[#1e1e1e] transition-all duration-300",
            isTerminalExpanded ? "h-64" : "h-10",
          )}
        >
          <div
            className="flex cursor-pointer items-center justify-between border-b border-[#333] px-4 py-2"
            onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Terminal</span>
            </div>
            <button className="rounded p-1 transition-colors hover:bg-[#333]">
              {isTerminalExpanded ? (
                <Minimize2 className="h-4 w-4 text-gray-400" />
              ) : (
                <Maximize2 className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {isTerminalExpanded && (
            <div className="h-[calc(100%-40px)] overflow-auto p-4 font-mono text-sm">
              <div className="text-green-400">
                $ npm run dev
                <br />
                <span className="text-gray-400">
                  ▲ Starting development server...
                </span>
                <br />
                <span className="text-gray-400">
                  ✓ Server running at http://localhost:3000
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Chat (AI + Team) */}
      <div className="flex w-96 flex-shrink-0 flex-col border-l border-[#e5e5e5] bg-white dark:border-[#3c3c3c] dark:bg-[#252526]">
        {/* Tabs Header */}
        <div className="h-16 flex-shrink-0 border-b border-[#e5e5e5] dark:border-[#3c3c3c]">
          <div className="flex h-full">
            {/* AI Tab */}
            <button
              onClick={() => setActiveChatTab("ai")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 transition-colors",
                activeChatTab === "ai"
                  ? "border-[#156d95] text-[#156d95] dark:text-[#4fc3f7]"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI Assistant</span>
            </button>
            {/* Team Chat Tab */}
            <button
              onClick={() => setActiveChatTab("team")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 transition-colors",
                activeChatTab === "team"
                  ? "border-[#156d95] text-[#156d95] dark:text-[#4fc3f7]"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Team Chat</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                {participants.filter((p) => p.status === "online").length}
              </span>
            </button>
          </div>
        </div>

        {/* AI Chat Content */}
        {activeChatTab === "ai" && (
          <>
            {/* Quick Actions */}
            <div className="flex-shrink-0 border-b border-[#e5e5e5] px-4 py-3 dark:border-[#3c3c3c]">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-1.5 rounded-md bg-[#fef3c7] px-3 py-1.5 text-xs text-amber-700 transition-colors hover:bg-[#fef3c7]/80">
                  <Bug className="h-3.5 w-3.5" />
                  Fix Bug
                </button>
                <button className="flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50">
                  <FileCode className="h-3.5 w-3.5" />
                  Explain Code
                </button>
                <button className="flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-xs text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50">
                  <Sparkles className="h-3.5 w-3.5" />
                  Optimize
                </button>
                <button className="flex items-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50">
                  <Code2 className="h-3.5 w-3.5" />
                  Write Tests
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md",
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-[#156d95] to-[#0d4a6b]"
                        : "bg-secondary dark:bg-[#3c3c3c]",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Sparkles className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs font-medium">AP</span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-md p-3",
                      msg.role === "user"
                        ? "bg-[#156d95] text-white"
                        : msg.type === "bug-fix"
                          ? "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30"
                          : "bg-secondary dark:bg-[#3c3c3c]",
                    )}
                  >
                    {msg.type === "bug-fix" && (
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                        <Bug className="h-3.5 w-3.5" />
                        Bug Fix Suggested
                      </div>
                    )}
                    <p
                      className={cn(
                        "text-sm whitespace-pre-wrap",
                        msg.role === "user"
                          ? "text-white"
                          : "text-foreground dark:text-[#d4d4d4]",
                      )}
                    >
                      {msg.content}
                    </p>
                    {msg.type === "bug-fix" && (
                      <button className="mt-3 flex items-center gap-1.5 rounded-md bg-[#156d95] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[#156d95]/90">
                        <Copy className="h-3.5 w-3.5" />
                        Copy Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#156d95] to-[#0d4a6b]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-secondary rounded-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" />
                      <div
                        className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-[#e5e5e5] p-4 dark:border-[#3c3c3c]">
              <div className="relative">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Describe a bug or ask for help..."
                  className="bg-secondary placeholder:text-muted-foreground text-foreground min-h-[80px] w-full resize-none rounded-md border-0 p-3 pr-12 text-sm focus:ring-2 focus:ring-[#156d95]/30 focus:outline-none dark:bg-[#3c3c3c] dark:text-[#d4d4d4]"
                />
                <button
                  className={cn(
                    "absolute right-3 bottom-3 rounded-md p-2 transition-colors",
                    aiInput.trim()
                      ? "bg-[#156d95] text-white hover:bg-[#156d95]/90"
                      : "text-muted-foreground cursor-not-allowed bg-[#e5e5e5] dark:bg-[#4a4a4a]",
                  )}
                  disabled={!aiInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-muted-foreground mt-2 text-center text-xs">
                AI analyzes your code context for accurate solutions
              </p>
            </div>
          </>
        )}

        {/* Team Chat Content */}
        {activeChatTab === "team" && (
          <>
            {/* Participants */}
            <div className="flex-shrink-0 border-b border-[#e5e5e5] px-4 py-3 dark:border-[#3c3c3c]">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Online Now (
                {participants.filter((p) => p.status === "online").length})
              </p>
              <div className="flex flex-wrap gap-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-secondary flex items-center gap-1.5 rounded-md px-2 py-1 dark:bg-[#3c3c3c]"
                  >
                    <div className="relative">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
                        style={{
                          backgroundColor:
                            teamMessages.find(
                              (m) => m.userId === participant.id,
                            )?.userColor || "#6b7280",
                        }}
                      >
                        {participant.name.charAt(0)}
                      </div>
                      <div
                        className={cn(
                          "absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#252526]",
                          participant.status === "online"
                            ? "bg-green-500"
                            : participant.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400",
                        )}
                      />
                    </div>
                    <span className="text-foreground text-xs dark:text-[#d4d4d4]">
                      {participant.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {teamMessages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: msg.userColor }}
                  >
                    {msg.userName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: msg.userColor }}
                      >
                        {msg.userName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-foreground bg-secondary rounded-md p-3 text-sm dark:bg-[#3c3c3c] dark:text-[#d4d4d4]">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-[#e5e5e5] p-4 dark:border-[#3c3c3c]">
              <div className="relative">
                <input
                  type="text"
                  value={teamChatInput}
                  onChange={(e) => setTeamChatInput(e.target.value)}
                  placeholder="Type a message to your team..."
                  className="bg-secondary placeholder:text-muted-foreground text-foreground w-full rounded-md border-0 px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-[#156d95]/30 focus:outline-none dark:bg-[#3c3c3c] dark:text-[#d4d4d4]"
                />
                <button
                  className={cn(
                    "absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 transition-colors",
                    teamChatInput.trim()
                      ? "bg-[#156d95] text-white hover:bg-[#156d95]/90"
                      : "text-muted-foreground cursor-not-allowed bg-[#e5e5e5] dark:bg-[#4a4a4a]",
                  )}
                  disabled={!teamChatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-muted-foreground mt-2 text-center text-xs">
                Press Enter to send • {selectedRoom?.participants || 0} people
                in this room
              </p>
            </div>
          </>
        )}
      </div>

      <GitHubImportDialog
        open={isGitHubDialogOpen}
        onOpenChange={setIsGitHubDialogOpen}
        onRepoSelect={handleRepoImport}
      />
    </div>
  );
}
