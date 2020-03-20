import React from "react";
import {Button, ButtonGroup} from "helpers/reactstrap";
import {
  useTimelineAddStepMutation,
  useTimelineReorderStepMutation,
  useTimelineRemoveStepMutation,
  useTimelineDuplicateStepMutation,
} from "generated/graphql";
import {MissionI} from "./TimelineTypes";

interface TimelineStepButtonsProps {
  mission: MissionI;
  setSelectedTimelineStep: (v: string | null) => void;
  selectedTimelineStep: string | null;
  removeMission: () => void;
  exportMissionScript: (mission: MissionI) => void;
}
const TimelineStepButtons: React.FC<TimelineStepButtonsProps> = ({
  mission,
  setSelectedTimelineStep,
  selectedTimelineStep,
  exportMissionScript,
  removeMission,
}) => {
  const [addStepMutation] = useTimelineAddStepMutation();
  const [removeStepMutation] = useTimelineRemoveStepMutation();
  const [duplicateStepMutation] = useTimelineDuplicateStepMutation();
  const [reorderStepMutation] = useTimelineReorderStepMutation();

  const addTimelineStep = async (inserted: boolean) => {
    const name = prompt("What is the name of the timeline step?");
    if (!name) return;

    const variables = {
      name,
      missionId: mission.id,
    };

    const res = await addStepMutation({variables});

    if (!res) return;
    const stepId = res.data?.addTimelineStep;
    if (!inserted && stepId) {
      setSelectedTimelineStep(stepId);
    }
    return stepId;
  };
  const insertTimelineStep = async () => {
    const stepId = await addTimelineStep(true);
    if (!stepId) return;
    const newIndex =
      mission.timeline.findIndex(s => s.id === selectedTimelineStep) + 1;
    const variables = {
      missionId: mission.id,
      timelineStepId: stepId,
      order: newIndex,
    };
    reorderStepMutation({variables});
    setSelectedTimelineStep(stepId);
  };
  const removeTimelineStep = (timelineStep: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this timeline step?")) {
      if (timelineStep === selectedTimelineStep) {
        setSelectedTimelineStep(null);
      }

      const variables = {
        timelineStepId: timelineStep,
        missionId: mission.id,
      };
      removeStepMutation({variables});
    }
  };
  const duplicateTimelineStep = () => {
    if (!selectedTimelineStep) return;
    const timelineStepId = selectedTimelineStep;
    const {id: missionId} = mission;

    duplicateStepMutation({variables: {missionId, timelineStepId}});
  };
  return (
    <>
      <ButtonGroup>
        <Button color="success" size="sm" onClick={addTimelineStep}>
          Add Step
        </Button>

        {selectedTimelineStep && selectedTimelineStep !== "mission" && (
          <>
            <Button color="warning" size="sm" onClick={insertTimelineStep}>
              Insert Step
            </Button>
            <Button color="info" size="sm" onClick={duplicateTimelineStep}>
              Duplicate
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={(e: React.MouseEvent) =>
                removeTimelineStep(selectedTimelineStep, e)
              }
            >
              Remove
            </Button>
          </>
        )}
      </ButtonGroup>

      <Button
        tag="a"
        size="sm"
        href={`/exportMission/${mission.id}`}
        block
        color="info"
      >
        Export Mission
      </Button>
      <Button
        color="warning"
        size="sm"
        block
        onClick={() => exportMissionScript(mission)}
      >
        Export Mission Script
      </Button>
      <Button block onClick={removeMission} size="sm" color="danger">
        Remove Mission
      </Button>
    </>
  );
};

export default TimelineStepButtons;