import { Octokit } from "octokit";

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  htmlUrl: string;
  defaultBranch: string;
  language: string | null;
  updatedAt: string | null;
}

export interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size?: number;
  sha: string;
  downloadUrl?: string;
  content?: string;
  encoding?: string;
}

export interface GitHubFileTree {
  path: string;
  name: string;
  type: "file" | "folder";
  children?: GitHubFileTree[];
}

export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
  });
}

export async function getUserRepositories(
  accessToken: string,
): Promise<GitHubRepo[]> {
  const octokit = createGitHubClient(accessToken);

  const { data: repos } = await octokit.request("GET /user/repos", {
    sort: "updated",
    per_page: 100,
    affiliation: "owner,collaborator,organization_member",
  });

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    htmlUrl: repo.html_url,
    defaultBranch: repo.default_branch,
    language: repo.language,
    updatedAt: repo.updated_at,
  }));
}

export async function getRepositoryContents(
  accessToken: string,
  owner: string,
  repo: string,
  path: string = "",
): Promise<GitHubContent[]> {
  const octokit = createGitHubClient(accessToken);

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path,
    },
  );

  if (Array.isArray(data)) {
    return data.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type as "file" | "dir" | "symlink" | "submodule",
      size: item.size,
      sha: item.sha,
      downloadUrl: item.download_url ?? undefined,
    }));
  }

  const contentItem = data as {
    name: string;
    path: string;
    type: "file" | "dir" | "symlink" | "submodule";
    size?: number;
    sha: string;
    download_url?: string | null;
    content?: string;
    encoding?: string;
  };

  return [
    {
      name: contentItem.name,
      path: contentItem.path,
      type: contentItem.type,
      size: contentItem.size,
      sha: contentItem.sha,
      downloadUrl: contentItem.download_url ?? undefined,
      content: contentItem.content,
      encoding: contentItem.encoding,
    },
  ];
}

export async function getFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  const octokit = createGitHubClient(accessToken);

  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path,
      },
    );

    if (Array.isArray(data)) return null;

    const content = (data as Record<string, unknown>).content;
    if (typeof content === "string") {
      return Buffer.from(content, "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

export function buildFileTree(contents: GitHubContent[]): GitHubFileTree[] {
  const tree: GitHubFileTree[] = [];

  const sortedContents = [...contents].sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    return a.name.localeCompare(b.name);
  });

  for (const item of sortedContents) {
    tree.push({
      path: item.path,
      name: item.name,
      type: item.type === "dir" ? "folder" : "file",
    });
  }

  return tree;
}

export function parseRepoUrl(
  url: string,
): { owner: string; repo: string } | null {
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (match && match[1] && match[2]) {
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""),
    };
  }
  return null;
}
