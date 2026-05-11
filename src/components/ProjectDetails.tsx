import React, { useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { useProjectsContext } from "../hooks/useProjectsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import ProjectForm from "./ProjectForm";
import { Project } from "../types/project";
import { deleteProject } from "../services/projectsService";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails = ({ project }: ProjectDetailsProps) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateOverlayOpen, setIsUpdateOverlayOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteOverlayOpen, setIsDeleteOverlayOpen] = useState(false);
  const { dispatch } = useProjectsContext();
  const { user } = useAuthContext();

  const projectId = project.projectId;

  const handleDelete = async () => {
    if (!user || !projectId) {
      return;
    }

    await deleteProject(user.accessToken, projectId);
    dispatch({ type: "DELETE_PROJECT", payload: project });
  };

  return (
    <div className="project bg-neutral-800 p-5 rounded-xl border border-neutral-700 flex flex-col gap-5 w-[30rem]">
      <div className="project-top">
        <span className="text-white">{projectId}</span>
        <h3 className="text-3xl font-medium truncate">{project.title}</h3>
        <span className="uppercase text-xs tracking-widest text-neutral-500 font-medium">
          {project.status}
        </span>
      </div>

      <div className="project-mid text-neutral-300 flex flex-col gap-2">
        <p className="text-neutral-400">{project.description || "No description added yet."}</p>
        <span>Added: {moment(project.createdAt).format("MMM DD, hh:mm A")}</span>
        <span>Updated: {moment(project.updatedAt).format("MMM DD, hh:mm A")}</span>
      </div>

      <div className="project-bottom flex gap-5">
        <Link
          to={`/projects/${projectId}`}
          className="bg-emerald-600 text-white py-2 px-5 rounded-lg shadow-sm shadow-emerald-950/30 hover:bg-emerald-500 duration-300 flex items-center gap-2 font-medium"
        >
          <Eye size={16} />
          View Work Items
        </Link>
        <button
          onClick={() => {
            setIsUpdateModalOpen(true);
            setIsUpdateOverlayOpen(true);
          }}
          className="border border-emerald-600/50 text-emerald-200 py-2 px-5 rounded-lg hover:bg-emerald-950/40 duration-300 flex items-center gap-2"
        >
          <Pencil size={16} />
          Update
        </button>
        <button
          onClick={() => {
            setIsDeleteModalOpen(true);
            setIsDeleteOverlayOpen(true);
          }}
          className="text-neutral-300 hover:underline flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      <div
        onClick={() => {
          setIsUpdateModalOpen(false);
          setIsUpdateOverlayOpen(false);
        }}
        className={`overlay fixed z-[1] h-screen w-screen bg-neutral-900/50 backdrop-blur-sm top-0 left-0 right-0 bottom-0 ${
          isUpdateOverlayOpen ? "" : "hidden"
        }`}
      />

      <div
        className={`update-modal w-[35rem] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-800 p-10 rounded-xl shadow-xl border border-neutral-700 z-[2] ${
          isUpdateModalOpen ? "" : "hidden"
        }`}
      >
        <h2 className="text-4xl font-medium text-white mb-10 capitalize">Update project</h2>
        <ProjectForm
          project={project}
          setIsModalOpen={setIsUpdateModalOpen}
          setIsOverlayOpen={setIsUpdateOverlayOpen}
        />
      </div>

      <div
        onClick={() => {
          setIsDeleteModalOpen(false);
          setIsDeleteOverlayOpen(false);
        }}
        className={`overlay fixed z-[1] h-screen w-screen bg-neutral-900/50 backdrop-blur-sm top-0 left-0 right-0 bottom-0 ${
          isDeleteOverlayOpen ? "" : "hidden"
        }`}
      />

      <div
        className={`update-modal w-[30rem] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-800 p-8 rounded-xl shadow-xl border border-neutral-700 z-[2] ${
          isDeleteModalOpen ? "" : "hidden"
        }`}
      >
        <h2 className="text-2xl font-medium text-white mb-4">Delete project</h2>
        <p className="text-neutral-300 mb-6">
          Are you sure you want to delete <span className="font-semibold">{project.title}</span>?
        </p>
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setIsDeleteOverlayOpen(false);
            }}
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              await handleDelete();
              setIsDeleteModalOpen(false);
              setIsDeleteOverlayOpen(false);
            }}
            className="px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-600 font-medium"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProjectDetails);
