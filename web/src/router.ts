export interface Route {
  view: "landing" | "lesson" | "sandbox";
  chapter_id?: string;
  lesson_id?: string;
}

export function parse_hash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").replace(/\/$/, "");

  if (!path || path === "") {
    return { view: "landing" };
  }

  if (path === "sandbox") {
    return { view: "sandbox" };
  }

  const segments = path.split("/");
  if (segments.length === 2) {
    return { view: "lesson", chapter_id: segments[0], lesson_id: segments[1] };
  }

  // Invalid path — treat as landing
  return { view: "landing" };
}

export function build_hash(route: Route): string {
  switch (route.view) {
    case "landing":
      return "#/";
    case "sandbox":
      return "#/sandbox";
    case "lesson":
      return `#/${route.chapter_id}/${route.lesson_id}`;
  }
}

export function get_current_route(): Route {
  return parse_hash(window.location.hash);
}

export function push_route(route: Route) {
  const hash = build_hash(route);
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}
