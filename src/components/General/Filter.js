
import { Fragment, useState, useContext, useEffect, useRef } from 'react'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { RefreshIcon, XIcon } from '@heroicons/react/outline'
import { ChevronDownIcon, FilterIcon, MinusSmIcon, PlusSmIcon, ViewGridIcon } from '@heroicons/react/solid'
import Web3Context from '../../store/web3-context';
import CollectionContext from '../../store/collection-context';
import MarketplaceContext from '../../store/marketplace-context';
import MusicNFT from '../../music-components/MusicNFT'
import { request } from '../../helpers/utils'
import NFTCollection from '../../abis/NFTCollection.json';
import web3 from '../../connection/web3'
const sortOptions = [
    { name: 'Most Popular', href: '#', current: true },
    { name: 'Best Rating', href: '#', current: false },
    { name: 'Newest', href: '#', current: false },
    { name: 'Price: Low to High', href: '#', current: false },
    { name: 'Price: High to Low', href: '#', current: false },
]
const subCategories = [
    { name: 'Totes', href: '#' },
    { name: 'Backpacks', href: '#' },
    { name: 'Travel Bags', href: '#' },
    { name: 'Hip Bags', href: '#' },
    { name: 'Laptop Sleeves', href: '#' },
]


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}
const Filter = ({ _account, type }) => {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [filters, setFilters] = useState([])
    const refFilter = useRef()
    const web3Ctx = useContext(Web3Context);
    const collectionCtx = useContext(CollectionContext);
    const markketplaceCtx = useContext(MarketplaceContext);

    const getNFTCollection = async (genreId) => {
        const networkId = await web3Ctx.loadNetworkId(web3);
        // Load Contracts      
        const nftDeployedNetwork = NFTCollection.networks[networkId];
        const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);
        if (nftContract) {
            if (genreId) {
                const response = await request(`/api/nft/genre-id/${genreId}`, {}, {}, "GET")
                collectionCtx.loadCollectionFromServer(nftContract, response);
                return
            }
            const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
            collectionCtx.loadCollection(nftContract, totalSupply);
        }
    }

    const fetchFilter = () => {
        request("/api/genre/index", {}, {}, "GET")
            .then(response => {
                const options = response.map(item => {
                    return {
                        value: item.id,
                        label: item.name,
                        checked: false
                    }
                })
                const _filters = [
                    {
                        id: 'genre',
                        name: 'Genre',
                        options: options
                    },
                    // {
                    //     id: 'status',
                    //     name: 'Status',
                    //     options: [
                    //         { value: 'on sale', label: 'On Sale', checked: false },
                    //         { value: 'not listed', label: 'Not Listed', checked: false },
                    //     ],
                    // },
                ]
                setFilters(_filters)
            })
    }
    useEffect(() => {
        fetchFilter()
    }, [])

    return (<>
        <div className="bg-white">
            <div>
                {/* Mobile filter dialog */}
                <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                    <Dialog as="div" className="fixed inset-0 flex z-0 lg:hidden" onClose={setMobileFiltersOpen}>

                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <div className="ml-auto relative max-w-xs w-full h-full bg-white shadow-xl py-4 pb-12 flex flex-col overflow-y-auto">
                                <div className="px-4 flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">Explore music</h2>
                                    <button
                                        type="button"
                                        className="-mr-2 w-10 h-10 bg-white p-2 rounded-md flex items-center justify-center text-gray-400"
                                        onClick={() => setMobileFiltersOpen(false)}
                                    >
                                        <span className="sr-only">Close menu</span>
                                        <XIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Filters */}
                                <form className="mt-4 border-t border-gray-200">
                                    <h3 className="sr-only">Categories</h3>
                                    {filters.map((section) => (
                                        <Disclosure as="div" key={section.id} className="border-t border-gray-200 px-4 py-6">
                                            {({ open }) => (
                                                <>
                                                    <h3 className="-mx-2 -my-3 flow-root">
                                                        <Disclosure.Button className="px-2 py-3 bg-white w-full flex items-center justify-between text-gray-400 hover:text-gray-500">
                                                            <span className="font-medium text-gray-900">{section.name}</span>
                                                            <span className="ml-6 flex items-center">
                                                                {open ? (
                                                                    <MinusSmIcon className="h-5 w-5" aria-hidden="true" />
                                                                ) : (
                                                                    <PlusSmIcon className="h-5 w-5" aria-hidden="true" />
                                                                )}
                                                            </span>
                                                        </Disclosure.Button>
                                                    </h3>
                                                    <Disclosure.Panel className="pt-6">
                                                        <div className="space-y-6">
                                                            {section.options.map((option, optionIdx) => (
                                                                <div key={option.value} className="flex items-center">
                                                                    <input
                                                                        id={`filter-mobile-${section.id}-${optionIdx}`}
                                                                        name={`${section.id}[]`}
                                                                        defaultValue={option.value}
                                                                        type="checkbox"
                                                                        defaultChecked={option.checked}
                                                                        className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <label
                                                                        htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                                                        className="ml-3 min-w-0 flex-1 text-gray-500"
                                                                    >
                                                                        {option.label}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Disclosure.Panel>
                                                </>
                                            )}
                                        </Disclosure>
                                    ))}
                                </form>
                            </div>
                        </Transition.Child>
                    </Dialog>
                </Transition.Root>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                    <div className="relative z-0 flex items-baseline justify-between pt-20 pb-6 border-b border-gray-200">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{type ==="all" ?"Explore music":"Profile"}</h1>
                        <div className="flex items-center">
                            <Menu as="div" className="relative inline-block text-left">
                                <div>
                                    <Menu.Button className="group inline-flex justify-center text-sm font-medium text-black-700 hover:text-gray-900">
                                        Sort
                                        <ChevronDownIcon
                                            className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                            aria-hidden="true"
                                        />
                                    </Menu.Button>
                                </div>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            {sortOptions.map((option) => (
                                                <Menu.Item key={option.name}>
                                                    {({ active }) => (
                                                        <a
                                                            href={option.href}
                                                            className={classNames(
                                                                option.current ? 'font-medium text-gray-900' : 'text-gray-500',
                                                                active ? 'bg-gray-100' : '',
                                                                'block px-4 py-2 text-sm'
                                                            )}
                                                        >
                                                            {option.name}
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <button type="button" className="p-2 -m-2 ml-5 sm:ml-7 text-gray-400 hover:text-gray-500">
                                <span className="sr-only">View grid</span>
                                <RefreshIcon onClick={() => {
                                    window.location.reload()
                                }} className="w-5 h-5" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="p-2 -m-2 ml-4 sm:ml-6 text-gray-400 hover:text-gray-500 lg:hidden"
                                onClick={() => setMobileFiltersOpen(true)}
                            >
                                <span className="sr-only">Filters</span>
                                <FilterIcon className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <section aria-labelledby="products-heading" className="pt-6 pb-24">
                        <h2 id="products-heading" className="sr-only">
                            Products
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-10 gap-y-10 border">
                            {/* Filters */}
                            <form id="create-course-form" ref={refFilter} className="lg:block">
                                <h3 className="sr-only">Categories</h3>
                                {filters.map((section) => (
                                    <Disclosure defaultOpen={true} as="div" key={section.id} className="border-y border-r border-gray-200 p-6">
                                        {({ open }) => (
                                            <>
                                                <h3 className="-my-3 flow-root">
                                                    <Disclosure.Button className="py-3 bg-white w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-500">
                                                        <span className="font-1xl text-gray-900">{section.name}</span>
                                                        <span className="ml-6 flex items-center">
                                                            {open ? (
                                                                <MinusSmIcon className="h-5 w-5" aria-hidden="true" />
                                                            ) : (
                                                                <PlusSmIcon className="h-5 w-5" aria-hidden="true" />
                                                            )}
                                                        </span>
                                                    </Disclosure.Button>
                                                </h3>
                                                <Disclosure.Panel className="pt-6">
                                                    <div className="space-y-4">
                                                        {section.options.map((option, optionIdx) => (
                                                            <div key={option.value} className="flex items-center">
                                                                <input

                                                                    id={`filter-${section.id}-${optionIdx}`}
                                                                    name={`${section.id}[]`}
                                                                    defaultValue={option.value}
                                                                    defaultChecked={option.checked}
                                                                    onChange={async (e) => {
                                                                        getNFTCollection(e.target.value)

                                                                    }}
                                                                    type="radio"
                                                                    className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <label
                                                                    htmlFor={`filter-${section.id}-${optionIdx}`}
                                                                    className="ml-3 text-sm text-black-600"
                                                                >
                                                                    {option.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </form>

                            {/* Product grid */}
                            <div className="lg:col-span-4">
                                <MusicNFT type={type} />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    </>)
}

export default Filter