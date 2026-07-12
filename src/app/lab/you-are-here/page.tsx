import { redirect } from "next/navigation";

// The lab experiment graduated to the homepage; keep old links working.
export default function YouAreHereLabPage() {
  redirect("/");
}
