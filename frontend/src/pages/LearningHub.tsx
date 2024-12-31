import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentList } from '../components/learning/content/ContentList';
import { ContentSubmission } from '../components/learning/content/ContentSubmission';
import { LearningPaths } from '../components/learning/paths/LearningPaths';
import { Tab } from '@headlessui/react';

const LearningHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { name: 'Popular Content', icon: '🔥' },
    { name: 'Learning Paths', icon: '🎓' },
    { name: 'Submit Content', icon: '✍️' },
  ];

  return (
    <div className="min-h-screen py-8 px-6">
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
        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="flex space-x-2 rounded-xl bg-slate-800/50 p-1">
            {tabs.map((tab, index) => (
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
          </Tab.List>

          <Tab.Panels className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Tab.Panel>
                  <ContentList />
                </Tab.Panel>
                <Tab.Panel>
                  <LearningPaths />
                </Tab.Panel>
                <Tab.Panel>
                  <ContentSubmission />
                </Tab.Panel>
              </motion.div>
            </AnimatePresence>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default LearningHub;