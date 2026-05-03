"use client";

import React from "react";

/* ─── colour tokens ─────────────────────────────────── */
const C = {
  green: "#00ff41",
  cyan: "#00f5ff",
  dimGreen: "#003b0f",
  black: "#000000",
} as const;

const mono = "'Share Tech Mono', monospace";

/* ─── types ─────────────────────────────────────────── */
interface AdminTableProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/* ─── AdminTable ─────────────────────────────────────── */
export function AdminTable({ title, description, children }: AdminTableProps) {
  return (
    <div
      style={{
        border: `1px solid ${C.dimGreen}`,
        background: C.black,
        overflow: "hidden",
        fontFamily: mono,
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: C.black,
          borderBottom: `1px solid ${C.dimGreen}`,
        }}
      >
        <h3
          style={{
            fontFamily: mono,
            fontSize: "13px",
            color: C.green,
            margin: 0,
            textTransform: "lowercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              fontFamily: mono,
              fontSize: "10px",
              color: C.dimGreen,
              margin: "2px 0 0",
              letterSpacing: "0.05em",
            }}
          >
            {description}
          </p>
        )}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

AdminTable.Head = function AdminTableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <thead style={{ background: "#010f01" }}>
      <tr>{children}</tr>
    </thead>
  );
};

AdminTable.HeadCell = function AdminTableHeadCell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <th
      style={{
        padding: "10px 16px",
        textAlign: "left",
        fontSize: "10px",
        fontFamily: mono,
        color: C.cyan,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        fontWeight: 600,
        borderBottom: `1px solid ${C.dimGreen}`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </th>
  );
};

AdminTable.Body = function AdminTableBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return <tbody>{children}</tbody>;
};

AdminTable.Row = function AdminTableRow({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <tr
      style={{
        borderBottom: `1px solid ${C.dimGreen}`,
        transition: "background 0.15s",
        ...style,
      }}
    >
      {children}
    </tr>
  );
};

AdminTable.Cell = function AdminTableCell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "12px 16px",
        fontFamily: mono,
        color: C.dimGreen,
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
};
