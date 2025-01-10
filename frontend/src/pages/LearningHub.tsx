import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentList } from '../components/learning/content/ContentList';
import { ContentSubmission } from '../components/learning/content/ContentSubmission';
import { LearningPaths } from '../components/learning/paths/LearningPaths';
import { TabGroup, TabList, Tab } from '@headlessui/react';


const LearningHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Popular Content', icon: '🔥' },
    { name: 'Learning Paths', icon: '🎓' },
    { name: 'Submit Content', icon: '✍️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <ContentList />;
      case 1:
        return <LearningPaths />;
      case 2:
        return <ContentSubmission />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] pt-[var(--navbar-height)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-[calc(100dvh-var(--navbar-height))] px-4 py-2 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text 
                         bg-gradient-to-r from-blue-400 to-purple-400">
              Web3 Learning Hub
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Learn, contribute, and earn rewards for quality educational content
            </p>
          </div>

          {/* Tab Navigation */}
          <TabGroup onChange={setActiveTab}>
            <TabList className="flex space-x-2 rounded-xl bg-slate-800/50 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `w-full rounded-lg py-3 px-4 text-sm font-medium leading-5
                     transition-all duration-200 ease-out
                     ${selected
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                     }`
                  }
                >
                  <span className="flex items-center justify-center gap-2">
                    {tab.icon} {tab.name}
                  </span>
                </Tab>
              ))}
            </TabList>

            <div className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;