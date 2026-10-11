import { useRef } from 'react'
import { DemoDb } from '../components/DemoDb'
import { LiveFeed } from '../components/LiveFeed'
import { Panel } from '../components/Panel'
import { RootsArt } from '../components/RootsArt'
import { useChapterTheme } from '../engine/useChapterTheme'

export function Roots() {
  const ref = useRef<HTMLElement>(null)
  useChapterTheme(ref, 'roots')

  return (
    <section id="roots" ref={ref} className="roots">
      <RootsArt />
      <div className="depth">
        <header className="depth__head">
          <h2 className="depth__title">Roots</h2>
          <p className="depth__line">Then I kept digging, toward what they run on.</p>
        </header>

        <div className="roots__grid">
          <div className="roots__text">
            <p>
              At EPAM I provisioned AWS with Terraform, deployed services to Kubernetes, and built Jenkins pipelines that publish Docker images to ECR, while watching
              clusters for configuration drift.
            </p>
            <p>
              Drift bothered me enough to write a Kubernetes operator that notices it and repairs it on its own. It looks after a PostgreSQL database: provisioning,
              backups and restores.
            </p>
            <p>
              This page keeps its visitor count in that database. Delete it below and every visitor sees the outage, then the rollback to the last backup.
            </p>
          </div>

          <Panel from="left" tone="terminal" className="roots__feed">
            <LiveFeed />
          </Panel>
        </div>

        <Panel from="bottom" tone="terminal" className="roots__console">
          <DemoDb />
        </Panel>
      </div>
    </section>
  )
}
