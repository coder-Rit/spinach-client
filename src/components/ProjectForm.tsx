import React, { FormEvent, useMemo, useState } from "react";
import ThemeSelect from "./ui/ThemeSelect";
import { useProjectsContext } from "../hooks/useProjectsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { Project } from "../types/project";
import { createProject, updateProject } from "../services/projectsService";

interface ProjectFormProps {
  project?: Project;
  setIsModalOpen?: (value: boolean) => void;
  setIsOverlayOpen?: (value: boolean) => void;
}

const ProjectForm = ({ project, setIsModalOpen, setIsOverlayOpen }: ProjectFormProps) => {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState<"OPEN" | "CLOSE">(project?.status || "OPEN");
  const [error, setError] = useState<string | null>(null);

  const { dispatch } = useProjectsContext();
  const { user } = useAuthContext();

  const statusOptions = useMemo(
    () => [
      { value: "OPEN", label: "Open" },
      { value: "CLOSE", label: "Close" },
    ],
    []
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setError("You must be logged in!");
      return;
    }

    try {
      if (!project?.projectId) {
        const created = await createProject(user.accessToken, { title, description, status });
        dispatch({ type: "CREATE_PROJECT", payload: created });
        setTitle("");
        setDescription("");
        setStatus("OPEN");
        setIsModalOpen?.(false);
        setIsOverlayOpen?.(false);
      } else {
        const updated = await updateProject(user.accessToken, project.projectId, {
          title,
          description,
          status,
        });
        dispatch({ type: "UPDATE_PROJECT", payload: updated });
        setIsModalOpen?.(false);
        setIsOverlayOpen?.(false);
      }

      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="project-form flex flex-col gap-5">
      {!project && <h2 className="text-4xl font-medium text-white mb-10 capitalize">Add a new project</h2>}

      <div className="form-control flex flex-col gap-2">
        <label htmlFor="title" className="cursor-pointer hover:text-white duration-300">
          Project Title
        </label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          type="text"
          placeholder="e.g. e-commerce website"
          id="title"
          className="bg-transparent border border-neutral-500 py-3 px-5 rounded-lg outline-none focus:border-white duration-300"
        />
      </div>

      <div className="form-control flex flex-col gap-2">
        <label htmlFor="description" className="cursor-pointer hover:text-white duration-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          id="description"
          placeholder="Short project summary"
          className="bg-transparent border border-neutral-500 py-3 px-5 rounded-lg outline-none focus:border-white duration-300"
        />
      </div>

      <div className="form-control flex flex-col gap-2">
        <label htmlFor="status" className="cursor-pointer hover:text-white duration-300">
          Status
        </label>
        <ThemeSelect
          id="status"
          value={status}
          onChange={(v) => setStatus(v as "OPEN" | "CLOSE")}
          options={statusOptions}
        />
      </div>

      <button
        type="submit"
        className="bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-500 duration-300 capitalize font-medium shadow-sm shadow-emerald-950/30"
      >
        {project ? "Confirm Update" : "Add project"}
      </button>

      {error && (
        <p className="bg-neutral-800 rounded-lg p-5 text-neutral-200 border border-neutral-600">{error}</p>
      )}
    </form>
  );
};

export default React.memo(ProjectForm);
