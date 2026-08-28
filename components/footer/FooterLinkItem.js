import Link from "next/link";

export default function FooterLinkItem({ path, to, label }){
  return (
    <Link
      href={to}
      className={`text-white hover:text-brightaqua duration-300 ${path === to ? 'text-white border-b-2' : ''}`}
    >
      { label }
    </Link>
  );
}
