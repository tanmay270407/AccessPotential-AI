import React from 'react';
import { JobRole } from '../../types';
import { ArrowRight, Briefcase, ChevronRight } from 'lucide-react';

interface JobSelectionScreenProps {
  jobs: JobRole[];
  selectedJobId: string;
  onSelectJob: (job: JobRole) => void;
}

export const JobSelectionScreen: React.FC<JobSelectionScreenProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
}) => {
  return (
    <div id="job-selection-screen" className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h2 id="job-selection-title" className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Choose a job
        </h2>
        <p className="text-stone-600 text-sm">
          Select a role to analyze your current baseline fit alongside your projected future growth potential.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          return (
            <div
              key={job.id}
              id={`job-card-${job.id}`}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-stone-900 shadow-md ring-1 ring-stone-900'
                  : 'border-stone-200 hover:border-stone-400 hover:shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800">
                  <Briefcase className="w-5 h-5 text-stone-700" />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider block">
                    {job.category}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 tracking-tight mt-0.5">
                    {job.title}
                  </h3>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {job.description}
                </p>

                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-medium text-stone-700 block mb-2">Required Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 bg-stone-100 text-stone-700 text-xs font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id={`btn-view-match-${job.id}`}
                  onClick={() => onSelectJob(job)}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors ${
                    isSelected
                      ? 'bg-stone-900 text-white hover:bg-stone-800'
                      : 'bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  <span>View Match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
