import styles from "./visual-system.module.css";

export function DevelopmentDiagnostics() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <aside className={styles.diagnostics} aria-label="Development diagnostics" data-testid="dev-diagnostics">
      <p className={styles.diagnosticsTitle}>Development diagnostics</p>
      <dl>
        <div>
          <dt>Shell</dt>
          <dd>ready</dd>
        </div>
        <div>
          <dt>Enhanced runtime</dt>
          <dd>not installed in scaffold</dd>
        </div>
        <div>
          <dt>Measured metrics</dt>
          <dd>not collected</dd>
        </div>
      </dl>
    </aside>
  );
}
